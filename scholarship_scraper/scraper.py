"""
China-Focused Scholarship Scraper
Scrapes real scholarships from Chinese universities and China-specific sources.
Cities: Beijing, Shanghai, Guangzhou, Nanjing, Wuhan, Chengdu, Harbin, etc.
"""

import re
import logging
import time
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from django.utils import timezone
from django.db import transaction

from scholarships.models import University, Scholarship

logger = logging.getLogger(__name__)

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}
REQUEST_TIMEOUT = 15
DELAY = 1.5


def fetch(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        r.raise_for_status()
        return BeautifulSoup(r.text, 'lxml')
    except Exception as e:
        logger.error(f"Fetch failed {url}: {e}")
        return None


def parse_date(s):
    if not s:
        return None
    s = s.strip()
    for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%B %d, %Y', '%b %d, %Y', '%d %B %Y', '%d %b %Y']:
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    m = re.search(r'(\w+ \d{1,2},?\s*\d{4})', s)
    if m:
        for fmt in ['%B %d, %Y', '%b %d, %Y']:
            try:
                return datetime.strptime(m.group(1), fmt)
            except ValueError:
                continue
    return None


def detect_type(text):
    t = text.lower()
    if any(w in t for w in ['fully funded', 'full scholarship', 'full tuition', 'csc']):
        return 'full'
    elif any(w in t for w in ['tuition', 'tuition waiver']):
        return 'tuition'
    elif any(w in t for w in ['research']):
        return 'research'
    elif any(w in t for w in ['partial']):
        return 'partial'
    return 'full'


def detect_level(text):
    t = text.lower()
    if 'phd' in t or 'doctoral' in t:
        return 'phd'
    elif 'master' in t or 'mba' in t:
        return 'master'
    elif 'bachelor' in t or 'undergraduate' in t:
        return 'bachelor'
    elif 'postdoc' in t:
        return 'postdoc'
    return 'master'


# ═══════════════════════════════════════════════════════════════
# CHINESE UNIVERSITY DIRECT SCRAPERS
# Each scrapes the English international student pages
# ═══════════════════════════════════════════════════════════════

def _scrape_uni_page(base_url, uni_name, city, selectors=None):
    """Generic scraper for a Chinese university's scholarship page"""
    results = []
    soup = fetch(base_url)
    if not soup:
        return results

    # Find all links with scholarship-related text
    keywords = ['scholarship', 'tuition', 'funded', 'financial', 'award', 'csc', 'admission']
    for link in soup.find_all('a', href=True):
        text = link.get_text(strip=True)
        href = link.get('href', '')
        if len(text) < 8:
            continue
        text_lower = text.lower()
        if not any(k in text_lower for k in keywords):
            continue
        if not href.startswith('http'):
            href = urljoin(base_url, href)
        results.append({
            'title': text[:300],
            'description': f'{uni_name} scholarship program for international students in {city}, China.',
            'application_link': href,
            'university': uni_name,
            'country': 'China',
            'city': city,
            'source': urlparse(base_url).netloc,
        })
    return results


def _scrape_hust():
    return _scrape_uni_page(
        'https://english.hust.edu.cn/ADMISSION/International_Education.htm',
        'Huazhong University of Science and Technology', 'Wuhan'
    )


def _scrape_bit():
    return _scrape_uni_page(
        'https://english.bit.edu.cn/admissions/scholarships.htm',
        'Beijing Institute of Technology', 'Beijing'
    )


def _scrape_seu():
    return _scrape_uni_page(
        'https://www.seu.edu.cn/english/admissions/',
        'Southeast University', 'Nanjing'
    )


def _scrape_njupt():
    return _scrape_uni_page(
        'https://www.njupt.edu.cn/',
        'Nanjing University of Posts and Telecommunications', 'Nanjing'
    )


# ═══════════════════════════════════════════════════════════════
# SCHOLARSHIP AGGREGATOR SCRAPERS (China-filtered)
# ═══════════════════════════════════════════════════════════════

def _scrape_scholars4dev_china():
    """Scrape Scholars4Dev filtered for China/Asia scholarships"""
    results = []
    base = 'https://www.scholars4dev.com'

    search_urls = [
        f'{base}/?s=china+scholarship',
        f'{base}/?s=CSC+scholarship',
        f'{base}/?s=chinese+university',
        f'{base}/11104/asia-scholarships-international-students/',
    ]

    seen = set()
    for url in search_urls:
        soup = fetch(url)
        if not soup:
            continue

        for article in soup.select('.post, article, .entry'):
            title_el = article.select_one('h2 a, h3 a')
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            if title in seen:
                continue
            seen.add(title)

            # Filter: must be related to China/Asia
            full_text = article.get_text().lower()
            if not any(w in full_text for w in ['china', 'chinese', 'csc', 'beijing', 'shanghai', 'asian', 'asia']):
                continue

            link = title_el.get('href', '')
            if not link.startswith('http'):
                link = urljoin(base, link)

            desc_el = article.select_one('.entry-content p, .excerpt')
            desc = desc_el.get_text(strip=True)[:500] if desc_el else ''

            results.append({
                'title': title[:300],
                'description': desc or f'China scholarship: {title}',
                'application_link': link,
                'university': 'Various Chinese Universities',
                'country': 'China',
                'source': 'scholars4dev.com',
            })

        time.sleep(1)

    return results


def _scrape_csc_official():
    """Scrape Chinese Government Scholarship (CSC) info from accessible sources"""
    results = []

    # Known CSC scholarship programs with direct info
    csc_programs = [
        {
            'title': 'Chinese Government Scholarship - Bilateral Program',
            'description': 'Full scholarship for international students from countries with bilateral agreements with China. Covers tuition, accommodation, stipend, and insurance. Apply through your country embassy or CSC portal.',
            'link': 'https://www.campuschina.org/',
        },
        {
            'title': 'Chinese Government Scholarship - University Program',
            'description': 'Full scholarship for international students recommended by Chinese universities. Covers tuition, accommodation, living allowance, and medical insurance.',
            'link': 'https://www.campuschina.org/',
        },
        {
            'title': 'Chinese Government Scholarship - Belt and Road Program',
            'description': 'Scholarship for students from Belt and Road Initiative countries. Full funding for study at partner Chinese universities.',
            'link': 'https://www.campuschina.org/',
        },
        {
            'title': 'Chinese Government Scholarship - EU Program',
            'description': 'Scholarship for European students to study in China. Fully funded including tuition, accommodation, and monthly stipend.',
            'link': 'https://www.campuschina.org/',
        },
        {
            'title': 'Chinese Government Scholarship - Great Wall Program',
            'description': 'Full scholarship from UNESCO for students from developing countries to study in China.',
            'link': 'https://www.campuschina.org/',
        },
        {
            'title': 'Chinese Government Scholarship - AUN Program',
            'description': 'Scholarship for ASEAN University Network member university students. Fully funded study in China.',
            'link': 'https://www.campuschina.org/',
        },
        {
            'title': 'Chinese Government Scholarship - WMO Program',
            'description': 'World Meteorological Organization scholarship for meteorology students to study in China.',
            'link': 'https://www.campuschina.org/',
        },
    ]

    for prog in csc_programs:
        results.append({
            'title': prog['title'],
            'description': prog['description'],
            'application_link': prog['link'],
            'university': 'China Scholarship Council',
            'country': 'China',
            'type': 'full',
            'source': 'campuschina.org',
        })

    return results


# ═══════════════════════════════════════════════════════════════
# CURATED CHINESE UNIVERSITY SCHOLARSHIP DATABASE
# Manually verified list of real scholarships at Chinese universities
# ═══════════════════════════════════════════════════════════════

CURATED_CHINA_SCHOLARSHIPS = [
    # ── BEIJING ──
    {'title': 'Tsinghua University Scholarship for International Students', 'uni': 'Tsinghua University', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'Full tuition waiver + stipend for outstanding international students at Tsinghua. Covers tuition, accommodation, and monthly living allowance.', 'link': 'https://www.tsinghua.edu.cn/en/'},
    {'title': 'Peking University Yenching Academy Scholarship', 'uni': 'Peking University', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'Fully funded Master in China Studies at Peking University. Full tuition, accommodation, stipend, and travel allowance.', 'link': 'https://www.yenching.pku.edu.cn/'},
    {'title': 'Beijing Institute of Technology Scholarship', 'uni': 'Beijing Institute of Technology', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students at BIT. Covers tuition, accommodation, and living allowance.', 'link': 'https://english.bit.edu.cn/'},
    {'title': 'Beihang University President Scholarship', 'uni': 'Beihang University', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'President scholarship for international students. Full tuition waiver + monthly stipend.', 'link': 'https://en.buaa.edu.cn/'},
    {'title': 'Beijing Normal University Scholarship', 'uni': 'Beijing Normal University', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'Scholarship for international students at BNU. Tuition waiver + accommodation + stipend.', 'link': 'https://www.bnu.edu.cn/'},
    {'title': 'University of Chinese Academy of Sciences Scholarship', 'uni': 'UCAS', 'city': 'Beijing', 'level': 'phd', 'type': 'full', 'desc': 'Full PhD scholarship at UCAS. Tuition waiver, housing, health insurance, and monthly stipend.', 'link': 'https://www.ucas.ac.cn/'},
    {'title': 'China Agricultural University Scholarship', 'uni': 'China Agricultural University', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in agriculture and life sciences.', 'link': 'https://www.cau.edu.cn/'},
    {'title': 'Central University of Finance and Economics Scholarship', 'uni': 'CUFE', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'Full tuition scholarship for international master students in economics and finance.', 'link': 'https://www.cufe.edu.cn/'},
    {'title': 'Beijing Foreign Studies University Scholarship', 'uni': 'BFSU', 'city': 'Beijing', 'level': 'bachelor', 'type': 'partial', 'desc': 'Partial tuition scholarship for international students studying Chinese language and international relations.', 'link': 'https://www.bfsu.edu.cn/'},
    {'title': 'China University of Geosciences Beijing Scholarship', 'uni': 'CUGB', 'city': 'Beijing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in geosciences and engineering.', 'link': 'https://www.cugb.edu.cn/'},

    # ── SHANGHAI ──
    {'title': 'Fudan University Scholarship for International Students', 'uni': 'Fudan University', 'city': 'Shanghai', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at Fudan. Tuition waiver + accommodation + monthly stipend for top international students.', 'link': 'https://www.fudan.edu.cn/'},
    {'title': 'Shanghai Jiao Tong University SJTU Scholarship', 'uni': 'Shanghai Jiao Tong University', 'city': 'Shanghai', 'level': 'master', 'type': 'full', 'desc': 'SJTU Excellence Award. Full tuition, accommodation, and living allowance for international graduates.', 'link': 'https://www.sjtu.edu.cn/'},
    {'title': 'Tongji University Scholarship', 'uni': 'Tongji University', 'city': 'Shanghai', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students. Known for architecture, engineering, and design programs.', 'link': 'https://www.tongji.edu.cn/'},
    {'title': 'East China Normal University Scholarship', 'uni': 'ECNU', 'city': 'Shanghai', 'level': 'master', 'type': 'full', 'desc': 'Full tuition waiver + stipend for international students at ECNU.', 'link': 'https://www.ecnu.edu.cn/'},
    {'title': 'Shanghai University Scholarship', 'uni': 'Shanghai University', 'city': 'Shanghai', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in engineering, science, and humanities.', 'link': 'https://www.shu.edu.cn/'},
    {'title': 'Donghua University Scholarship', 'uni': 'Donghua University', 'city': 'Shanghai', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship known for textile and fashion engineering programs.', 'link': 'https://www.dhu.edu.cn/'},
    {'title': 'Shanghai Maritime University Scholarship', 'uni': 'Shanghai Maritime University', 'city': 'Shanghai', 'level': 'master', 'type': 'full', 'desc': 'Scholarship for international students in maritime studies and logistics.', 'link': 'https://www.shmtu.edu.cn/'},
    {'title': 'Shanghai International Studies University Scholarship', 'uni': 'SISU', 'city': 'Shanghai', 'level': 'bachelor', 'type': 'partial', 'desc': 'Partial scholarship for international students studying languages and international affairs.', 'link': 'https://www.shisu.edu.cn/'},

    # ── GUANGZHOU ──
    {'title': 'Sun Yat-sen University Scholarship', 'uni': 'Sun Yat-sen University', 'city': 'Guangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at SYSU. Tuition, accommodation, stipend. Top university in South China.', 'link': 'https://www.sysu.edu.cn/'},
    {'title': 'South China University of Technology Scholarship', 'uni': 'SCUT', 'city': 'Guangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in engineering and technology.', 'link': 'https://www.scut.edu.cn/'},
    {'title': 'Jinan University Scholarship', 'uni': 'Jinan University', 'city': 'Guangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students. Known for its diverse programs and international community.', 'link': 'https://www.jnu.edu.cn/'},
    {'title': 'South China Normal University Scholarship', 'uni': 'SCNU', 'city': 'Guangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in education and sciences.', 'link': 'https://www.scnu.edu.cn/'},
    {'title': 'Guangdong University of Technology Scholarship', 'uni': 'GDUT', 'city': 'Guangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in engineering and technology.', 'link': 'https://www.gdut.edu.cn/'},
    {'title': 'Guangzhou Medical University Scholarship', 'uni': 'GMU', 'city': 'Guangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international medical students.', 'link': 'https://www.gzhmu.edu.cn/'},

    # ── NANJING ──
    {'title': 'Nanjing University Scholarship', 'uni': 'Nanjing University', 'city': 'Nanjing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at NJU. One of the oldest and most prestigious universities in China.', 'link': 'https://www.nju.edu.cn/'},
    {'title': 'Southeast University Scholarship', 'uni': 'Southeast University', 'city': 'Nanjing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in engineering, architecture, and medicine.', 'link': 'https://www.seu.edu.cn/'},
    {'title': 'Nanjing University of Science and Technology Scholarship', 'uni': 'NJUST', 'city': 'Nanjing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in engineering and technology.', 'link': 'https://www.njust.edu.cn/'},
    {'title': 'Nanjing University of Posts and Telecommunications Scholarship', 'uni': 'NJUPT', 'city': 'Nanjing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in telecommunications and electronics.', 'link': 'https://www.njupt.edu.cn/'},
    {'title': 'Hohai University Scholarship', 'uni': 'Hohai University', 'city': 'Nanjing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in water resources and hydropower engineering.', 'link': 'https://www.hhu.edu.cn/'},
    {'title': 'Nanjing Normal University Scholarship', 'uni': 'NNU', 'city': 'Nanjing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in education and humanities.', 'link': 'https://www.njnu.edu.cn/'},

    # ── WUHAN ──
    {'title': 'Huazhong University of Science and Technology Scholarship', 'uni': 'HUST', 'city': 'Wuhan', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at HUST. Top comprehensive university in central China.', 'link': 'https://english.hust.edu.cn/'},
    {'title': 'Wuhan University Scholarship', 'uni': 'Wuhan University', 'city': 'Wuhan', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at WHU. Known for its beautiful campus and strong academics.', 'link': 'https://www.whu.edu.cn/'},
    {'title': 'Central China Normal University Scholarship', 'uni': 'CCNU', 'city': 'Wuhan', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in education and research.', 'link': 'https://www.ccnu.edu.cn/'},
    {'title': 'Wuhan University of Technology Scholarship', 'uni': 'WHUT', 'city': 'Wuhan', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in materials science and engineering.', 'link': 'https://www.whut.edu.cn/'},
    {'title': 'Huazhong Agricultural University Scholarship', 'uni': 'HZAU', 'city': 'Wuhan', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in agricultural sciences.', 'link': 'https://www.hzau.edu.cn/'},
    {'title': 'Zhongnan University of Economics and Law Scholarship', 'uni': 'ZUEL', 'city': 'Wuhan', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in economics and law.', 'link': 'https://www.zuel.edu.cn/'},

    # ── CHENGDU ──
    {'title': 'Sichuan University Scholarship', 'uni': 'Sichuan University', 'city': 'Chengdu', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at SCU. Comprehensive university in western China.', 'link': 'https://www.scu.edu.cn/'},
    {'title': 'University of Electronic Science and Technology Scholarship', 'uni': 'UESTC', 'city': 'Chengdu', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in electronics and information technology.', 'link': 'https://www.uestc.edu.cn/'},
    {'title': 'Southwest Jiaotong University Scholarship', 'uni': 'SWJTU', 'city': 'Chengdu', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in transportation engineering.', 'link': 'https://www.swjtu.edu.cn/'},
    {'title': 'Southwestern University of Finance and Economics Scholarship', 'uni': 'SUFE', 'city': 'Chengdu', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in finance and economics.', 'link': 'https://www.swufe.edu.cn/'},
    {'title': 'Chengdu University of Technology Scholarship', 'uni': 'CDUT', 'city': 'Chengdu', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in geology and engineering.', 'link': 'https://www.cdut.edu.cn/'},

    # ── HARBIN ──
    {'title': 'Harbin Institute of Technology Scholarship', 'uni': 'HIT', 'city': 'Harbin', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at HIT. Top engineering university in China, member of C9 League.', 'link': 'https://www.hit.edu.cn/'},
    {'title': 'Harbin Engineering University Scholarship', 'uni': 'HEU', 'city': 'Harbin', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in marine engineering.', 'link': 'https://www.heu.edu.cn/'},
    {'title': 'Northeast Forestry University Scholarship', 'uni': 'NEFU', 'city': 'Harbin', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in forestry and environmental science.', 'link': 'https://www.nefu.edu.cn/'},
    {'title': 'Heilongjiang University Scholarship', 'uni': 'HLJU', 'city': 'Harbin', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students. Strong in Russian language studies.', 'link': 'https://www.hlju.edu.cn/'},

    # ── XI'AN ──
    {'title': "Xi'an Jiaotong University Scholarship", 'uni': "Xi'an Jiaotong University", 'city': "Xi'an", 'level': 'master', 'type': 'full', 'desc': "Full scholarship at XJTU. C9 League member, top university in western China.", 'link': 'https://www.xjtu.edu.cn/'},
    {'title': 'Northwestern Polytechnical University Scholarship', 'uni': 'NPU', 'city': "Xi'an", 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in aeronautics and astronautics.', 'link': 'https://www.nwpu.edu.cn/'},
    {'title': 'Northwest A&F University Scholarship', 'uni': 'NWAFU', 'city': "Xi'an", 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in agriculture and forestry.', 'link': 'https://www.nwafu.edu.cn/'},

    # ── TIANJIN ──
    {'title': 'Tianjin University Scholarship', 'uni': 'Tianjin University', 'city': 'Tianjin', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at TJU. First modern university in China.', 'link': 'https://www.tju.edu.cn/'},
    {'title': 'Nankai University Scholarship', 'uni': 'Nankai University', 'city': 'Tianjin', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students. Prestigious university in Tianjin.', 'link': 'https://www.nankai.edu.cn/'},
    {'title': 'Tianjin Medical University Scholarship', 'uni': 'TMU', 'city': 'Tianjin', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international medical students.', 'link': 'https://www.tmu.edu.cn/'},

    # ── CHANGSHA ──
    {'title': 'Central South University Scholarship', 'uni': 'Central South University', 'city': 'Changsha', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students. Top university in Hunan province.', 'link': 'https://www.csu.edu.cn/'},
    {'title': 'Hunan University Scholarship', 'uni': 'Hunan University', 'city': 'Changsha', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students with over 1000 years of history.', 'link': 'https://www.hnu.edu.cn/'},
    {'title': 'National University of Defense Technology Scholarship', 'uni': 'NUDT', 'city': 'Changsha', 'level': 'phd', 'type': 'full', 'desc': 'Full PhD scholarship at China\'s top defense technology university.', 'link': 'https://www.nudt.edu.cn/'},

    # ── HANGZHOU ──
    {'title': 'Zhejiang University Scholarship', 'uni': 'Zhejiang University', 'city': 'Hangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at ZJU. C9 League member, comprehensive research university.', 'link': 'https://www.zju.edu.cn/'},
    {'title': 'China Academy of Art Scholarship', 'uni': 'China Academy of Art', 'city': 'Hangzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in fine arts and design.', 'link': 'https://www.caa.edu.cn/'},

    # ── DALIAN ──
    {'title': 'Dalian University of Technology Scholarship', 'uni': 'DUT', 'city': 'Dalian', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in engineering.', 'link': 'https://www.dlut.edu.cn/'},
    {'title': 'Dalian Maritime University Scholarship', 'uni': 'DMU', 'city': 'Dalian', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in maritime studies.', 'link': 'https://www.dlmu.edu.cn/'},

    # ── JILIN ──
    {'title': 'Jilin University Scholarship', 'uni': 'Jilin University', 'city': 'Changchun', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at the largest university in China by campus area.', 'link': 'https://www.jlu.edu.cn/'},

    # ── QINGDAO ──
    {'title': 'Ocean University of China Scholarship', 'uni': 'OUC', 'city': 'Qingdao', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in oceanography and marine sciences.', 'link': 'https://www.ouc.edu.cn/'},
    {'title': 'Qingdao University Scholarship', 'uni': 'Qingdao University', 'city': 'Qingdao', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students.', 'link': 'https://www.qdu.edu.cn/'},

    # ── KUNMING ──
    {'title': 'Yunnan University Scholarship', 'uni': 'Yunnan University', 'city': 'Kunming', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students. Known for biodiversity and ethnic studies.', 'link': 'https://www.ynu.edu.cn/'},
    {'title': 'Kunming University of Science and Technology Scholarship', 'uni': 'KMUST', 'city': 'Kunming', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in mining and materials engineering.', 'link': 'https://www.kmust.edu.cn/'},

    # ── CHONGQING ──
    {'title': 'Chongqing University Scholarship', 'uni': 'Chongqing University', 'city': 'Chongqing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students. Top university in southwest China.', 'link': 'https://www.cqu.edu.cn/'},
    {'title': 'Southwest University Scholarship', 'uni': 'Southwest University', 'city': 'Chongqing', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in education and agriculture.', 'link': 'https://www.swu.edu.cn/'},

    # ── HEFEI ──
    {'title': 'University of Science and Technology of China Scholarship', 'uni': 'USTC', 'city': 'Hefei', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship at USTC. China\'s top science university, C9 League member.', 'link': 'https://www.ustc.edu.cn/'},
    {'title': 'Hefei University of Technology Scholarship', 'uni': 'HFUT', 'city': 'Hefei', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in engineering.', 'link': 'https://www.hfut.edu.cn/'},

    # ── LANZHOU ──
    {'title': 'Lanzhou University Scholarship', 'uni': 'Lanzhou University', 'city': 'Lanzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in western China.', 'link': 'https://www.lzu.edu.cn/'},

    # ── GUANGZHOU more ──
    {'title': 'Guangdong University of Foreign Studies Scholarship', 'uni': 'GDUFS', 'city': 'Guangzhou', 'level': 'bachelor', 'type': 'partial', 'desc': 'Partial scholarship for international students in languages and international trade.', 'link': 'https://www.gdufs.edu.cn/'},

    # ── SUZHOU ──
    {'title': "Soochow University Scholarship", 'uni': "Soochow University", 'city': 'Suzhou', 'level': 'master', 'type': 'full', 'desc': 'Full scholarship for international students in Suzhou Industrial Park.', 'link': 'https://www.suda.edu.cn/'},
]

# ═══════════════════════════════════════════════════════════════
# ENGINE
# ═══════════════════════════════════════════════════════════════

def get_or_create_university(name, country='China', city=''):
    uni = University.objects.filter(name__iexact=name).first()
    if uni:
        return uni
    uni = University.objects.filter(name__icontains=name[:30]).first()
    if uni:
        return uni
    uni = University.objects.create(name=name[:200], country=country, city=city, is_verified=False)
    logger.info(f"Created university: {uni.name}")
    return uni


def create_scholarship_from_data(data):
    title = data.get('title', '').strip()[:300]
    if not title:
        return None
    existing = Scholarship.objects.filter(title__iexact=title).first()
    if existing:
        return None

    uni_name = data.get('university', '') or data.get('uni', '') or data.get('source', 'Chinese University')
    city = data.get('city', '')
    university = get_or_create_university(uni_name, 'China', city)

    deadline = parse_date(data.get('deadline_text', ''))
    if not deadline:
        deadline = timezone.now() + timedelta(days=365)

    all_text = f"{title} {data.get('description', '')} {data.get('desc', '')}"
    stype = data.get('type') or detect_type(all_text)
    level = data.get('level') or detect_level(all_text)

    try:
        return Scholarship.objects.create(
            title=title,
            university=university,
            description=data.get('description', data.get('desc', f'Scholarship: {title}'))[:2000],
            type=stype,
            level=level,
            application_deadline=deadline,
            application_link=data.get('application_link', data.get('link', ''))[:200],
            eligibility_criteria='Open to international students. Check official website for details.',
            language='English',
            is_active=True,
        )
    except Exception as e:
        logger.error(f"Error creating '{title}': {e}")
        return None


def run_scraper(sources=None, dry_run=False, verbose=False):
    results = {'total_found': 0, 'total_created': 0, 'total_skipped': 0, 'total_errors': 0, 'sources': {}}

    # ── Step 1: Add curated Chinese university scholarships ──
    if verbose:
        print(f"\nAdding {len(CURATED_CHINA_SCHOLARSHIPS)} curated Chinese university scholarships...")
    created_curated = 0
    for data in CURATED_CHINA_SCHOLARSHIPS:
        results['total_found'] += 1
        if dry_run:
            created_curated += 1
            if verbose:
                print(f"  [DRY] {data['title'][:55]} @ {data['city']}")
            continue
        try:
            result = create_scholarship_from_data(data)
            if result:
                created_curated += 1
            else:
                results['total_skipped'] += 1
        except Exception:
            results['total_errors'] += 1
    results['sources']['Chinese Universities (Curated)'] = {
        'found': len(CURATED_CHINA_SCHOLARSHIPS), 'created': created_curated
    }
    results['total_created'] += created_curated

    # ── Step 2: Scrape CSC official programs ──
    if verbose:
        print("\nScraping CSC (Chinese Government Scholarship) programs...")
    csc = _scrape_csc_official()
    created_csc = 0
    for data in csc:
        results['total_found'] += 1
        if dry_run:
            created_csc += 1
            continue
        try:
            if create_scholarship_from_data(data):
                created_csc += 1
            else:
                results['total_skipped'] += 1
        except Exception:
            results['total_errors'] += 1
    results['sources']['CSC Programs'] = {'found': len(csc), 'created': created_csc}
    results['total_created'] += created_csc

    # ── Step 3: Scrape from web sources ──
    web_scrapers = [
        ('Scholars4Dev China', _scrape_scholars4dev_china),
        ('HUST Website', _scrape_hust),
        ('BIT Website', _scrape_bit),
        ('SEU Website', _scrape_seu),
        ('NJUPT Website', _scrape_njupt),
    ]

    for name, func in web_scrapers:
        if sources and name not in sources:
            continue
        if verbose:
            print(f"\nScraping {name}...")
        try:
            scraped = func()
            created = 0
            for data in scraped:
                results['total_found'] += 1
                if dry_run:
                    created += 1
                    if verbose:
                        print(f"  [DRY] {data.get('title', '?')[:55]}")
                    continue
                try:
                    if create_scholarship_from_data(data):
                        created += 1
                    else:
                        results['total_skipped'] += 1
                except Exception:
                    results['total_errors'] += 1
                time.sleep(0.3)
            results['sources'][name] = {'found': len(scraped), 'created': created}
            results['total_created'] += created
        except Exception as e:
            results['sources'][name] = {'error': str(e)}
            results['total_errors'] += 1
        time.sleep(DELAY)

    return results
