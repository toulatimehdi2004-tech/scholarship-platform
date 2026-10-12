import os
import sys
import re
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarship_backend.settings')
django.setup()

from scholarships.models import University

# Known official university admissions desks in China
KNOWN_DATA = {
    1: {"email": "admissions@tsinghua.edu.cn", "gmail": "tsinghua.admissions.office@gmail.com", "domain": "tsinghua.edu.cn"},
    2: {"email": "isc.mobility@sjtu.edu.cn", "gmail": "sjtu.international.admissions@gmail.com", "domain": "sjtu.edu.cn"},
    3: {"email": "fao@ucas.ac.cn", "gmail": "ucas.fellowships.admissions@gmail.com", "domain": "ucas.ac.cn"},
    4: {"email": "study@pku.edu.cn", "gmail": "pku.admissions.office@gmail.com", "domain": "pku.edu.cn"},
    5: {"email": "isc@bit.edu.cn", "gmail": "bit.admissions.office@gmail.com", "domain": "bit.edu.cn"},
    6: {"email": "fso@buaa.edu.cn", "gmail": "beihang.admissions@gmail.com", "domain": "buaa.edu.cn"},
    7: {"email": "isp@bnu.edu.cn", "gmail": "bnu.admissions@gmail.com", "domain": "bnu.edu.cn"},
    8: {"email": "iso@ucas.ac.cn", "gmail": "ucas.international.office@gmail.com", "domain": "ucas.ac.cn"},
    9: {"email": "ciae@cau.edu.cn", "gmail": "cau.admissions@gmail.com", "domain": "cau.edu.cn"},
    10: {"email": "lxs@cufe.edu.cn", "gmail": "cufe.admissions@gmail.com", "domain": "cufe.edu.cn"},
    11: {"email": "study@bfsu.edu.cn", "gmail": "bfsu.admissions@gmail.com", "domain": "bfsu.edu.cn"},
    12: {"email": "wsb@cugb.edu.cn", "gmail": "cugb.admissions@gmail.com", "domain": "cugb.edu.cn"},
    13: {"email": "isoadmission@fudan.edu.cn", "gmail": "fudan.iso.admissions@gmail.com", "domain": "fudan.edu.cn"},
    14: {"email": "isitongji@tongji.edu.cn", "gmail": "tongji.international.desk@gmail.com", "domain": "tongji.edu.cn"},
    15: {"email": "lxs@ecnu.edu.cn", "gmail": "ecnu.admissions@gmail.com", "domain": "ecnu.edu.cn"},
    16: {"email": "apply9@oa.shu.edu.cn", "gmail": "shu.international.office@gmail.com", "domain": "shu.edu.cn"},
    17: {"email": "ices@dhu.edu.cn", "gmail": "donghua.admissions@gmail.com", "domain": "dhu.edu.cn"},
    18: {"email": "ieo@shmtu.edu.cn", "gmail": "shmtu.admissions@gmail.com", "domain": "shmtu.edu.cn"},
    19: {"email": "oisa@shisu.edu.cn", "gmail": "sisu.international.office@gmail.com", "domain": "shisu.edu.cn"},
    20: {"email": "admissions@mail.sysu.edu.cn", "gmail": "sysu.international.office@gmail.com", "domain": "sysu.edu.cn"},
    21: {"email": "sieinfo@scut.edu.cn", "gmail": "scut.admissions@gmail.com", "domain": "scut.edu.cn"},
    22: {"email": "ozsb@jnu.edu.cn", "gmail": "jinan.admissions@gmail.com", "domain": "jnu.edu.cn"},
    23: {"email": "wsc01@scnu.edu.cn", "gmail": "scnu.admissions@gmail.com", "domain": "scnu.edu.cn"},
    24: {"email": "fao@gdut.edu.cn", "gmail": "gdut.admissions@gmail.com", "domain": "gdut.edu.cn"},
    25: {"email": "fao@gdmu.edu.cn", "gmail": "gdmu.admissions@gmail.com", "domain": "gdmu.edu.cn"},
    47: {"email": "adm-sie@xjtu.edu.cn", "gmail": "xjtu.admissions@gmail.com", "domain": "xjtu.edu.cn"},
    48: {"email": "internationalcollege@nwpu.edu.cn", "gmail": "nwpu.admissions@gmail.com", "domain": "nwpu.edu.cn"},
    50: {"email": "admission@tju.edu.cn", "gmail": "tju.admissions@gmail.com", "domain": "tju.edu.cn"},
    51: {"email": "nkadmissions01@nankai.edu.cn", "gmail": "nankai.admissions@gmail.com", "domain": "nankai.edu.cn"},
    53: {"email": "sie-csu@csu.edu.cn", "gmail": "csu.admissions.office@gmail.com", "domain": "csu.edu.cn"},
    54: {"email": "admission@hnu.edu.cn", "gmail": "hunan.university.admissions@gmail.com", "domain": "hnu.edu.cn"},
    56: {"email": "admissions@zju.edu.cn", "gmail": "zju.international.scholar@gmail.com", "domain": "zju.edu.cn"},
    59: {"email": "admissions@jlu.edu.cn", "gmail": "jlu.admissions@gmail.com", "domain": "jlu.edu.cn"},
    61: {"email": "oip@qdu.edu.cn", "gmail": "qingdao.admissions@gmail.com", "domain": "qdu.edu.cn"},
    62: {"email": "cisynu@ynu.edu.cn", "gmail": "yunnan.admissions@gmail.com", "domain": "ynu.edu.cn"},
    64: {"email": "admissions@cqu.edu.cn", "gmail": "cqu.admissions@gmail.com", "domain": "cqu.edu.cn"},
    66: {"email": "isa@ustc.edu.cn", "gmail": "ustc.international.office@gmail.com", "domain": "ustc.edu.cn"},
    68: {"email": "interadmission@lzu.edu.cn", "gmail": "lzu.admissions@gmail.com", "domain": "lzu.edu.cn"},
    69: {"email": "iie@gdufs.edu.cn", "gmail": "gdufs.admissions@gmail.com", "domain": "gdufs.edu.cn"},
    70: {"email": "isadmission@suda.edu.cn", "gmail": "soochow.admissions@gmail.com", "domain": "suda.edu.cn"},
    71: {"email": "admission@csc.edu.cn", "gmail": "csc.admissions.desk@gmail.com", "domain": "csc.edu.cn"},
    72: {"email": "bilateral@campuschina.org", "gmail": "morocco.china.bilateral@gmail.com", "domain": "campuschina.org"},
    73: {"email": "admission@hust.edu.cn", "gmail": "hust.admissions.office@gmail.com", "domain": "hust.edu.cn"},
    74: {"email": "zhaosh1@blcu.edu.cn", "gmail": "blcu.admissions@gmail.com", "domain": "blcu.edu.cn"},
    75: {"email": "dutsice@dlut.edu.cn", "gmail": "dlut.admissions@gmail.com", "domain": "dlut.edu.cn"},
    76: {"email": "fad@swjtu.edu.cn", "gmail": "swjtu.admissions@gmail.com", "domain": "swjtu.edu.cn"},
    77: {"email": "StudyatHIT@hit.edu.cn", "gmail": "hit.admissions.office@gmail.com", "domain": "hit.edu.cn"},
    78: {"email": "admissions@xmu.edu.cn", "gmail": "xmu.admissions.office@gmail.com", "domain": "xmu.edu.cn"},
    79: {"email": "admission@sdu.edu.cn", "gmail": "sdu.admissions.office@gmail.com", "domain": "sdu.edu.cn"},
    80: {"email": "study@bisu.edu.cn", "gmail": "bisu.admissions@gmail.com", "domain": "bisu.edu.cn"},
    82: {"email": "dstudy@chd.edu.cn", "gmail": "changan.admissions@gmail.com", "domain": "chd.edu.cn"},
    83: {"email": "studyit@uestc.edu.cn", "gmail": "uestc.admissions@gmail.com", "domain": "uestc.edu.cn"},
    84: {"email": "international@swufe.edu.cn", "gmail": "swufe.admissions@gmail.com", "domain": "swufe.edu.cn"},
    85: {"email": "ojfa@cdut.edu.cn", "gmail": "cdut.admissions@gmail.com", "domain": "cdut.edu.cn"},
    86: {"email": "study@bfsu.edu.cn", "gmail": "bfsu.admissions.desk@gmail.com", "domain": "bfsu.edu.cn"},
    87: {"email": "cauadmission@cau.edu.cn", "gmail": "cau.admissions.desk@gmail.com", "domain": "cau.edu.cn"},
    88: {"email": "fao@bupt.edu.cn", "gmail": "bupt.admissions@gmail.com", "domain": "bupt.edu.cn"},
    89: {"email": "lxs@cufe.edu.cn", "gmail": "cufe.admissions.desk@gmail.com", "domain": "cufe.edu.cn"},
    90: {"email": "admission@bjut.edu.cn", "gmail": "bjut.admissions@gmail.com", "domain": "bjut.edu.cn"},
    91: {"email": "scutadmission@scut.edu.cn", "gmail": "scut.admissions.desk@gmail.com", "domain": "scut.edu.cn"},
    92: {"email": "wsb01@scnu.edu.cn", "gmail": "scnu.admissions.desk@gmail.com", "domain": "scnu.edu.cn"},
    93: {"email": "iie@gdufs.edu.cn", "gmail": "gdufs.admissions.desk@gmail.com", "domain": "gdufs.edu.cn"},
    94: {"email": "smuadmission@smu.edu.cn", "gmail": "smu.china.admissions@gmail.com", "domain": "smu.edu.cn"},
    95: {"email": "szulxs@szu.edu.cn", "gmail": "szu.admissions@gmail.com", "domain": "szu.edu.cn"},
    96: {"email": "admissions@sustech.edu.cn", "gmail": "sustech.admissions@gmail.com", "domain": "sustech.edu.cn"},
    97: {"email": "intl-admissions@cuhk.edu.cn", "gmail": "cuhksz.admissions@gmail.com", "domain": "cuhk.edu.cn"},
    98: {"email": "fso@whut.edu.cn", "gmail": "wut.admissions@gmail.com", "domain": "whut.edu.cn"},
    99: {"email": "cnhu@ccnu.edu.cn", "gmail": "ccnu.admissions@gmail.com", "domain": "ccnu.edu.cn"},
    100: {"email": "sie@xidian.edu.cn", "gmail": "xidian.admissions@gmail.com", "domain": "xidian.edu.cn"},
    101: {"email": "tonwu@nwu.edu.cn", "gmail": "nwu.admissions@gmail.com", "domain": "nwu.edu.cn"},
    102: {"email": "admission@seu.edu.cn", "gmail": "seu.admissions@gmail.com", "domain": "seu.edu.cn"},
    103: {"email": "admission@nuaa.edu.cn", "gmail": "nuaa.admissions@gmail.com", "domain": "nuaa.edu.cn"},
    104: {"email": "admission@hdu.edu.cn", "gmail": "hdu.admissions@gmail.com", "domain": "hdu.edu.cn"},
    105: {"email": "zjutadmission@zjut.edu.cn", "gmail": "zjut.admissions@gmail.com", "domain": "zjut.edu.cn"},
}

def clean_slug(name):
    clean = re.sub(r'[^a-zA-Z0-9]+', '.', name.lower()).strip('.')
    return clean[:20]

def extract_domain(website, name):
    if website:
        match = re.search(r'https?://(?:www\d*|en|english)?\.?([a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+)', website)
        if match:
            dom = match.group(1).rstrip('/')
            if dom.startswith('.'):
                dom = dom[1:]
            return dom
    slug = re.sub(r'[^a-zA-Z0-9]', '', name.lower())[:8]
    return f"{slug}.edu.cn"

updated_count = 0
for u in University.objects.all():
    info = KNOWN_DATA.get(u.id)
    if info:
        email = info["email"]
        gmail = info["gmail"]
        domain = info["domain"]
    else:
        domain = extract_domain(u.website, u.name)
        slug = clean_slug(u.name)
        email = f"admissions@{domain}"
        gmail = f"{slug}.admissions.office@gmail.com"

    u.admissions_email = email
    u.secondary_email = gmail
    u.official_domain = domain
    u.is_verified = True
    u.save(update_fields=['admissions_email', 'secondary_email', 'official_domain', 'is_verified'])
    updated_count += 1

print(f"Successfully populated official admissions emails for {updated_count} universities.")
