from django.core.management.base import BaseCommand
from scholarships.models import University, Scholarship
from django.utils import timezone
import datetime


class Command(BaseCommand):
    help = 'Update universities and scholarships with real data'

    def handle(self, *args, **options):
        self.update_universities()
        self.update_scholarships()
        self.stdout.write(self.style.SUCCESS('Done!'))

    def update_universities(self):
        data = {
            'Tsinghua University': {
                'website': 'https://www.tsinghua.edu.cn/en/',
                'description': 'Tsinghua University is a comprehensive research university located in Beijing, China. Founded in 1911, it is consistently ranked as one of the top universities in Asia and the world. Tsinghua offers more than 90 undergraduate programs, over 100 master\'s programs, and over 80 doctoral programs across 16 schools and 55 departments.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Peking University': {
                'website': 'https://www.pku.edu.cn/',
                'description': 'Peking University (PKU), founded in 1898, is one of China\'s oldest and most prestigious universities. Located in Beijing, PKU is known for its strong programs in humanities, social sciences, sciences, and medicine. It consistently ranks among the top universities in Asia.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Fudan University': {
                'website': 'https://www.fudan.edu.cn/en/',
                'description': 'Fudan University is a prestigious research university in Shanghai, China, founded in 1905. It is one of the oldest higher education institutions in China and offers programs in humanities, social sciences, natural sciences, engineering, and medicine.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Shanghai Jiao Tong University': {
                'website': 'https://www.sjtu.edu.cn/',
                'description': 'Shanghai Jiao Tong University (SJTU) is a top research university in Shanghai, China, founded in 1896. Known for its engineering, science, and medicine programs, SJTU is a C9 League member and consistently ranked among China\'s best universities.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Zhejiang University': {
                'website': 'https://www.zju.edu.cn/english/',
                'description': 'Zhejiang University (ZJU) is a comprehensive research university in Hangzhou, China, founded in 1897. It is a member of the C9 League and offers over 140 undergraduate programs. ZJU is renowned for engineering, computer science, and agricultural sciences.',
                'city': 'Hangzhou', 'country': 'China', 'is_verified': True,
            },
            'Fudan University': {
                'website': 'https://www.fudan.edu.cn/en/',
                'description': 'Fudan University is a prestigious research university in Shanghai, China, founded in 1905. It is one of the oldest higher education institutions in China and offers programs in humanities, social sciences, natural sciences, engineering, and medicine.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Nanjing University': {
                'website': 'https://www.nju.edu.cn/english/',
                'description': 'Nanjing University (NJU) is a prestigious public research university in Nanjing, China, founded in 1902. It is a C9 League member and consistently ranked among China\'s top five universities, with strengths in humanities, social sciences, and natural sciences.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'Wuhan University': {
                'website': 'https://www.whu.edu.cn/',
                'description': 'Wuhan University (WHU) is a comprehensive national research university in Wuhan, China, founded in 1893. Known for its beautiful campus and strong programs in law, remote sensing, and测绘 (surveying), WHU is one of China\'s most prestigious universities.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
            'Huazhong University of Science and Technology': {
                'website': 'https://english.hust.edu.cn/',
                'description': 'HUST: Huazhong University of Science and Technology (HUST) is a comprehensive research university in Wuhan, China, founded in 1952. Known as the "MIT of China", it excels in engineering, science, and technology. HUST is a member of the C9 League and Double First Class University Plan.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
            'HUST': {
                'website': 'https://english.hust.edu.cn/',
                'description': 'Huazhong University of Science and Technology (HUST) is a comprehensive research university in Wuhan, China, founded in 1952. Known as the "MIT of China", it excels in engineering, science, and technology. HUST is a member of the Double First Class University Plan.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
            'Sun Yat-sen University': {
                'website': 'https://www.sysu.edu.cn/english/',
                'description': 'Sun Yat-sen University (SYSU) is a comprehensive research university in Guangzhou, China, founded in 1924. It offers programs in humanities, social sciences, natural sciences, engineering, and medicine across multiple campuses.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'Harbin Institute of Technology': {
                'website': 'https://www.hit.edu.cn/',
                'description': 'Harbin Institute of Technology (HIT) is a top research university in Harbin, China, founded in 1920. It is a C9 League member known for engineering, computer science, and aerospace programs. HIT is a "985 Project" and "211 Project" university.',
                'city': 'Harbin', 'country': 'China', 'is_verified': True,
            },
            'HIT': {
                'website': 'https://www.hit.edu.cn/',
                'description': 'Harbin Institute of Technology (HIT) is a top research university in Harbin, China, founded in 1920. It is a C9 League member known for engineering, computer science, and aerospace programs.',
                'city': 'Harbin', 'country': 'China', 'is_verified': True,
            },
            'Beihang University': {
                'website': 'https://www.buaa.edu.cn/',
                'description': 'Beihang University (formerly Beijing University of Aeronautics and Astronautics) is a research university in Beijing, China, founded in 1952. It is a leading university in aviation, aerospace, and computer science in China.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Beijing Normal University': {
                'website': 'https://www.bnu.edu.cn/',
                'description': 'Beijing Normal University (BNU) is a prestigious research university in Beijing, China, founded in 1902. It is known for education, psychology, and humanities programs. BNU is a Double First Class University and a "985 Project" university.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Tongji University': {
                'website': 'https://www.tongji.edu.cn/english/',
                'description': 'Tongji University is a comprehensive research university in Shanghai, China, founded in 1907. It is especially renowned for civil engineering, architecture, and urban planning programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Sichuan University': {
                'website': 'https://www.scu.edu.cn/',
                'description': 'Sichuan University (SCU) is a prestigious research university in Chengdu, China, founded in 1896. It is one of the largest universities in China, offering over 300 degree programs across humanities, sciences, engineering, and medicine.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'Shandong University': {
                'website': 'https://www.sdu.edu.cn/',
                'description': 'Shandong University (SDU) is a prestigious public research university in Jinan, China, founded in 1901. It is a Double First Class University with strong programs in mathematics, literature, and engineering.',
                'city': 'Jinan', 'country': 'China', 'is_verified': True,
            },
            'Xi\'an Jiaotong University': {
                'website': 'https://en.xjtu.edu.cn/',
                'description': 'Xi\'an Jiaotong University (XJTU) is a C9 League research university in Xi\'an, China, founded in 1896. It is known for engineering, energy, and management programs. XJTU is a "985 Project" and "211 Project" university.',
                'city': 'Xi\'an', 'country': 'China', 'is_verified': True,
            },
            'Jilin University': {
                'website': 'https://www.jlu.edu.cn/',
                'description': 'Jilin University (JLU) is a comprehensive research university in Changchun, China, founded in 1946. It is one of the largest universities in China, with strong programs in chemistry, automotive engineering, and law.',
                'city': 'Changchun', 'country': 'China', 'is_verified': True,
            },
            'Nankai University': {
                'website': 'https://www.nankai.edu.cn/',
                'description': 'Nankai University is a comprehensive research university in Tianjin, China, founded in 1919. It is known for economics, chemistry, and history programs. Nankai is a Double First Class University.',
                'city': 'Tianjin', 'country': 'China', 'is_verified': True,
            },
            'Tianjin University': {
                'website': 'https://www.tju.edu.cn/',
                'description': 'Tianjin University (TJU) is the oldest modern university in China, founded in 1895 as Peiyang University. Located in Tianjin, it is renowned for engineering, architecture, and chemistry programs.',
                'city': 'Tianjin', 'country': 'China', 'is_verified': True,
            },
            'Dalian University of Technology': {
                'website': 'https://www.dlut.edu.cn/',
                'description': 'Dalian University of Technology (DUT) is a comprehensive research university in Dalian, China, founded in 1949. It is a "985 Project" and "211 Project" university known for chemical engineering, mechanics, and information technology.',
                'city': 'Dalian', 'country': 'China', 'is_verified': True,
            },
            'Xiamen University': {
                'website': 'https://www.xmu.edu.cn/',
                'description': 'Xiamen University (XMU) is a prestigious research university in Xiamen, China, founded in 1921. Known for its beautiful campus, it has strong programs in economics, chemistry, marine sciences, and journalism.',
                'city': 'Xiamen', 'country': 'China', 'is_verified': True,
            },
            'Beijing Institute of Technology': {
                'website': 'https://www.bit.edu.cn/',
                'description': 'Beijing Institute of Technology (BIT) is a research university in Beijing, China, founded in 1940. It is known for engineering, computer science, and applied mathematics programs. BIT is a "985 Project" and "211 Project" university.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'China Agricultural University': {
                'website': 'https://www.cau.edu.cn/',
                'description': 'China Agricultural University (CAU) is a comprehensive research university in Beijing, China, founded in 1905. It is China\'s top university for agricultural sciences, food science, and biology programs.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Central South University': {
                'website': 'https://www.csu.edu.cn/',
                'description': 'Central South University (CSU) is a comprehensive research university in Changsha, China, founded in 2000 from a merger of three universities. Known for metallurgy, materials science, and medicine.',
                'city': 'Changsha', 'country': 'China', 'is_verified': True,
            },
            'Lanzhou University': {
                'website': 'https://www.lzu.edu.cn/',
                'description': 'Lanzhou University (LZU) is a comprehensive research university in Lanzhou, China, founded in 1909. It is known for chemistry, physics, ecology, and atmospheric sciences programs.',
                'city': 'Lanzhou', 'country': 'China', 'is_verified': True,
            },
            'Southeast University': {
                'website': 'https://www.seu.edu.cn/',
                'description': 'Southeast University (SEU) is a prestigious research university in Nanjing, China, founded in 1902. It is known for architecture, civil engineering, and biomedical engineering programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'Jinan University': {
                'website': 'https://www.jnu.edu.cn/',
                'description': 'Jinan University (JNU) is a comprehensive research university in Guangzhou, China, founded in 1906. It is known for Chinese language education, journalism, and economics programs for international students.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'Chongqing University': {
                'website': 'https://www.cqu.edu.cn/',
                'description': 'Chongqing University (CQU) is a comprehensive research university in Chongqing, China, founded in 1929. It is known for architecture, electrical engineering, and mechanical engineering programs.',
                'city': 'Chongqing', 'country': 'China', 'is_verified': True,
            },
            'Hunan University': {
                'website': 'https://www.hnu.edu.cn/',
                'description': 'Hunan University (HNU) is a comprehensive research university in Changsha, China, founded in 976 AD (one of China\'s oldest institutions). Known for civil engineering, design, and chemistry programs.',
                'city': 'Changsha', 'country': 'China', 'is_verified': True,
            },
            'Soochow University': {
                'website': 'https://www.suda.edu.cn/',
                'description': 'Soochow University is a comprehensive research university in Suzhou, China, founded in 1900. Known for Chinese language education, textile engineering, and medicine programs.',
                'city': 'Suzhou', 'country': 'China', 'is_verified': True,
            },
            'Beijing Foreign Studies University': {
                'website': 'https://www.bfsu.edu.cn/',
                'description': 'Beijing Foreign Studies University (BFSU) is a prestigious language university in Beijing, China, founded in 1941. It offers programs in over 100 languages and is known as the "Cradle of Diplomats" in China.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'BFSU': {
                'website': 'https://www.bfsu.edu.cn/',
                'description': 'Beijing Foreign Studies University (BFSU) is a prestigious language university in Beijing, China, founded in 1941. It offers programs in over 100 languages and is known as the "Cradle of Diplomats" in China.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Beijing Language and Culture University': {
                'website': 'https://www.blcu.edu.cn/',
                'description': 'Beijing Language and Culture University (BLCU) is a specialized university in Beijing, China, founded in 1962. It is the only university in China dedicated to teaching Chinese language and culture to international students.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'BLCU': {
                'website': 'https://www.blcu.edu.cn/',
                'description': 'Beijing Language and Culture University (BLCU) is a specialized university in Beijing, China, founded in 1962. It is the only university in China dedicated to teaching Chinese language and culture to international students.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'East China Normal University': {
                'website': 'https://www.ecnu.edu.cn/',
                'description': 'East China Normal University (ECNU) is a comprehensive research university in Shanghai, China, founded in 1951. It is known for education, psychology, and geography programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'ECNU': {
                'website': 'https://www.ecnu.edu.cn/',
                'description': 'East China Normal University (ECNU) is a comprehensive research university in Shanghai, China, founded in 1951. It is known for education, psychology, and geography programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'UCAS': {
                'website': 'https://www.ucas.ac.cn/',
                'description': 'University of Chinese Academy of Sciences (UCAS) is a research university in Beijing, China, founded in 1978. It is affiliated with the Chinese Academy of Sciences and offers graduate programs in natural sciences.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'China Scholarship Council': {
                'website': 'https://www.csc.edu.cn/',
                'description': 'The China Scholarship Council (CSC) is a non-profit institution authorized by the Ministry of Education of China. It administers the Chinese Government Scholarship and other scholarship programs for international students.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Harbin Institute of Technology': {
                'website': 'https://www.hit.edu.cn/',
                'description': 'Harbin Institute of Technology (HIT) is a C9 League research university in Harbin, China, founded in 1920. Known for engineering, computer science, and aerospace programs.',
                'city': 'Harbin', 'country': 'China', 'is_verified': True,
            },
            'South China University of Technology': {
                'website': 'https://www2.scut.edu.cn/',
                'description': 'South China University of Technology (SCUT) is a comprehensive research university in Guangzhou, China, founded in 1952. Known for chemical engineering, materials science, and light industry programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'SCUT': {
                'website': 'https://www2.scut.edu.cn/',
                'description': 'South China University of Technology (SCUT) is a comprehensive research university in Guangzhou, China, founded in 1952. Known for chemical engineering, materials science, and light industry programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'Shanghai Maritime University': {
                'website': 'https://www.shmtu.edu.cn/',
                'description': 'Shanghai Maritime University is a specialized university in Shanghai, China, founded in 1909. It is known for maritime studies, logistics, and shipping programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Donghua University': {
                'website': 'https://www.dhu.edu.cn/',
                'description': 'Donghua University is a research university in Shanghai, China, founded in 1951. Known for textile engineering, fashion design, and materials science programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Shanghai University': {
                'website': 'https://www.shu.edu.cn/',
                'description': 'Shanghai University (SHU) is a comprehensive research university in Shanghai, China, founded in 1922. Known for engineering, arts, and social sciences programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Southwest Jiaotong University': {
                'website': 'https://www.swjtu.edu.cn/',
                'description': 'Southwest Jiaotong University (SWJTU) is a research university in Chengdu, China, founded in 1896. Known for civil engineering, transportation, and mechanical engineering programs.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'Central University of Finance and Economics': {
                'website': 'https://www.cufe.edu.cn/',
                'description': 'Central University of Finance and Economics (CUFE) is a specialized university in Beijing, China, founded in 1949. Known for economics, finance, and accounting programs.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'CUFE': {
                'website': 'https://www.cufe.edu.cn/',
                'description': 'Central University of Finance and Economics (CUFE) is a specialized university in Beijing, China, founded in 1949. Known for economics, finance, and accounting programs.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Nanjing University of Science and Technology': {
                'website': 'https://www.njust.edu.cn/',
                'description': 'Nanjing University of Science and Technology (NJUST) is a research university in Nanjing, China, founded in 1953. Known for engineering, chemistry, and materials science programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'NJUST': {
                'website': 'https://www.njust.edu.cn/',
                'description': 'Nanjing University of Science and Technology (NJUST) is a research university in Nanjing, China, founded in 1953. Known for engineering, chemistry, and materials science programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'University of Electronic Science and Technology of China': {
                'website': 'https://www.uestc.edu.cn/',
                'description': 'University of Electronic Science and Technology of China (UESTC) is a research university in Chengdu, China, founded in 1956. Known for electronics, information technology, and computer science programs.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'UESTC': {
                'website': 'https://www.uestc.edu.cn/',
                'description': 'University of Electronic Science and Technology of China (UESTC) is a research university in Chengdu, China, founded in 1956. Known for electronics, information technology, and computer science programs.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'Northwestern Polytechnical University': {
                'website': 'https://www.nwpu.edu.cn/',
                'description': 'Northwestern Polytechnical University (NPU) is a research university in Xi\'an, China, founded in 1938. Known for aerospace, marine engineering, and computer science programs.',
                'city': 'Xi\'an', 'country': 'China', 'is_verified': True,
            },
            'NPU': {
                'website': 'https://www.nwpu.edu.cn/',
                'description': 'Northwestern Polytechnical University (NPU) is a research university in Xi\'an, China, founded in 1938. Known for aerospace, marine engineering, and computer science programs.',
                'city': 'Xi\'an', 'country': 'China', 'is_verified': True,
            },
            'Wuhan University of Technology': {
                'website': 'https://www.whut.edu.cn/',
                'description': 'Wuhan University of Technology (WHUT) is a research university in Wuhan, China, founded in 1898. Known for materials science, automotive engineering, and transport technology programs.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
            'WHUT': {
                'website': 'https://www.whut.edu.cn/',
                'description': 'Wuhan University of Technology (WHUT) is a research university in Wuhan, China, founded in 1898. Known for materials science, automotive engineering, and transport technology programs.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
            'Northeast Forestry University': {
                'website': 'https://www.nefu.edu.cn/',
                'description': 'Northeast Forestry University (NEFU) is a specialized university in Harbin, China, founded in 1952. Known for forestry, ecology, and wood science programs.',
                'city': 'Harbin', 'country': 'China', 'is_verified': True,
            },
            'NEFU': {
                'website': 'https://www.nefu.edu.cn/',
                'description': 'Northeast Forestry University (NEFU) is a specialized university in Harbin, China, founded in 1952. Known for forestry, ecology, and wood science programs.',
                'city': 'Harbin', 'country': 'China', 'is_verified': True,
            },
            'Hohai University': {
                'website': 'https://www.hhu.edu.cn/',
                'description': 'Hohai University is a specialized university in Nanjing, China, founded in 1915. Known for water conservancy, civil engineering, and oceanography programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'Nanjing Normal University': {
                'website': 'https://www.njnu.edu.cn/',
                'description': 'Nanjing Normal University (NNU) is a comprehensive university in Nanjing, China, founded in 1902. Known for education, literature, and geography programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'NNU': {
                'website': 'https://www.njnu.edu.cn/',
                'description': 'Nanjing Normal University (NNU) is a comprehensive university in Nanjing, China, founded in 1902. Known for education, literature, and geography programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'South China Normal University': {
                'website': 'https://www.scnu.edu.cn/',
                'description': 'South China Normal University (SCNU) is a comprehensive university in Guangzhou, China, founded in 1933. Known for education, psychology, and astronomy programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'SCNU': {
                'website': 'https://www.scnu.edu.cn',
                'description': 'South China Normal University (SCNU) is a comprehensive university in Guangzhou, China, founded in 1933. Known for education, psychology, and astronomy programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'Guangdong University of Technology': {
                'website': 'https://www.gdut.edu.cn/',
                'description': 'Guangdong University of Technology (GDUT) is a comprehensive university in Guangzhou, China, founded in 1958. Known for engineering, design, and management programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'GDUT': {
                'website': 'https://www.gdut.edu.cn/',
                'description': 'Guangdong University of Technology (GDUT) is a comprehensive university in Guangzhou, China, founded in 1958. Known for engineering, design, and management programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'Beijing International Studies University': {
                'website': 'https://www.bisu.edu.cn/',
                'description': 'Beijing International Studies University (BISU) is a specialized university in Beijing, China, founded in 1964. Known for tourism management, foreign languages, and international trade programs.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'BISU': {
                'website': 'https://www.bisu.edu.cn',
                'description': 'Beijing International Studies University (BISU) is a specialized university in Beijing, China, founded in 1964. Known for tourism management, foreign languages, and international trade programs.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Shanghai International Studies University': {
                'website': 'https://www.shisu.edu.cn/',
                'description': 'Shanghai International Studies University (SISU) is a specialized university in Shanghai, China, founded in 1949. Known for foreign languages, translation, and international studies programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'SISU': {
                'website': 'https://www.shisu.edu.cn/',
                'description': 'Shanghai International Studies University (SISU) is a specialized university in Shanghai, China, founded in 1949. Known for foreign languages, translation, and international studies programs.',
                'city': 'Shanghai', 'country': 'China', 'is_verified': True,
            },
            'Guangdong Medical University': {
                'website': 'https://www.gdmu.edu.cn/',
                'description': 'Guangdong Medical University (GMU) is a specialized medical university in Dongguan, China, founded in 1958. Known for clinical medicine, public health, and nursing programs.',
                'city': 'Dongguan', 'country': 'China', 'is_verified': True,
            },
            'GMU': {
                'website': 'https://www.gdmu.edu.cn/',
                'description': 'Guangdong Medical University (GMU) is a specialized medical university in Dongguan, China, founded in 1958. Known for clinical medicine, public health, and nursing programs.',
                'city': 'Dongguan', 'country': 'China', 'is_verified': True,
            },
            'Guangdong University of Foreign Studies': {
                'website': 'https://www.gdufs.edu.cn/',
                'description': 'Guangdong University of Foreign Studies (GDUFS) is a specialized university in Guangzhou, China, founded in 1965. Known for foreign languages, international trade, and translation programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'GDUFS': {
                'website': 'https://www.gdufs.edu.cn',
                'description': 'Guangdong University of Foreign Studies (GDUFS) is a specialized university in Guangzhou, China, founded in 1965. Known for foreign languages, international trade, and translation programs.',
                'city': 'Guangzhou', 'country': 'China', 'is_verified': True,
            },
            'Nanjing University of Posts and Telecommunications': {
                'website': 'https://www.njupt.edu.cn/',
                'description': 'Nanjing University of Posts and Telecommunications (NJUPT) is a specialized university in Nanjing, China, founded in 1942. Known for telecommunications, electronics, and computer science programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'NJUPT': {
                'website': 'https://www.njupt.edu.cn/',
                'description': 'Nanjing University of Posts and Telecommunications (NJUPT) is a specialized university in Nanjing, China, founded in 1942. Known for telecommunications, electronics, and computer science programs.',
                'city': 'Nanjing', 'country': 'China', 'is_verified': True,
            },
            'Northwest A&F University': {
                'website': 'https://www.nwafu.edu.cn/',
                'description': 'Northwest A&F University (NWAFU) is a comprehensive university in Yangling, China, founded in 1934. Known for agriculture, forestry, and water conservancy programs.',
                'city': 'Yangling', 'country': 'China', 'is_verified': True,
            },
            'NWAFU': {
                'website': 'https://www.nwafu.edu.cn/',
                'description': 'Northwest A&F University (NWAFU) is a comprehensive university in Yangling, China, founded in 1934. Known for agriculture, forestry, and water conservancy programs.',
                'city': 'Yangling', 'country': 'China', 'is_verified': True,
            },
            'Southwest University of Finance and Economics': {
                'website': 'https://www.swufe.edu.cn/',
                'description': 'Southwest University of Finance and Economics (SWUFE) is a specialized university in Chengdu, China, founded in 1925. Known for economics, finance, and business administration programs.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'SUFE': {
                'website': 'https://www.swufe.edu.cn/',
                'description': 'Southwest University of Finance and Economics (SWUFE) is a specialized university in Chengdu, China, founded in 1925. Known for economics, finance, and business administration programs.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'Chengdu University of Technology': {
                'website': 'https://www.cdut.edu.cn/',
                'description': 'Chengdu University of Technology (CDUT) is a comprehensive university in Chengdu, China, founded in 1956. Known for geology, petroleum engineering, and nuclear science programs.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'CDUT': {
                'website': 'https://www.cdut.edu.cn/',
                'description': 'Chengdu University of Technology (CDUT) is a comprehensive university in Chengdu, China, founded in 1956. Known for geology, petroleum engineering, and nuclear science programs.',
                'city': 'Chengdu', 'country': 'China', 'is_verified': True,
            },
            'Heilongjiang University': {
                'website': 'https://www.hlju.edu.cn/',
                'description': 'Heilongjiang University (HLJU) is a comprehensive university in Harbin, China, founded in 1941. Known for foreign languages, chemistry, and electronics programs.',
                'city': 'Harbin', 'country': 'China', 'is_verified': True,
            },
            'HLJU': {
                'website': 'https://www.hlju.edu.cn/',
                'description': 'Heilongjiang University (HLJU) is a comprehensive university in Harbin, China, founded in 1941. Known for foreign languages, chemistry, and electronics programs.',
                'city': 'Harbin', 'country': 'China', 'is_verified': True,
            },
            'Beijing University of Chemical Technology': {
                'website': 'https://www.buct.edu.cn/',
                'description': 'Beijing University of Chemical Technology (BUCT) is a research university in Beijing, China, founded in 1958. Known for chemical engineering, materials science, and chemistry programs.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'China University of Geosciences': {
                'website': 'https://www.cug.edu.cn/',
                'description': 'China University of Geosciences (CUG) is a research university in Wuhan, China, founded in 1952. Known for geology, resources, and environmental sciences programs.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
            'CUGB': {
                'website': 'https://www.cugb.edu.cn/',
                'description': 'China University of Geosciences Beijing (CUGB) is a research university in Beijing, China, founded in 1952. Known for geology, petroleum engineering, and mineral resources programs.',
                'city': 'Beijing', 'country': 'China', 'is_verified': True,
            },
            'Zhongnan University of Economics and Law': {
                'website': 'https://www.zuel.edu.cn',
                'description': 'Zhongnan University of Economics and Law (ZUEL) is a specialized university in Wuhan, China, founded in 1948. Known for economics, law, and management programs.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
            'ZUEL': {
                'website': 'https://www.zuel.edu.cn',
                'description': 'Zhongnan University of Economics and Law (ZUEL) is a specialized university in Wuhan, China, founded in 1948. Known for economics, law, and management programs.',
                'city': 'Wuhan', 'country': 'China', 'is_verified': True,
            },
        }

        updated = 0
        for name, info in data.items():
            try:
                uni = University.objects.get(name=name)
                changed = False
                for field, value in info.items():
                    if value and getattr(uni, field) != value:
                        setattr(uni, field, value)
                        changed = True
                if changed:
                    uni.save()
                    updated += 1
                    self.stdout.write(f'  Updated: {name}')
            except University.DoesNotExist:
                self.stdout.write(f'  Not found: {name}')

        self.stdout.write(self.style.SUCCESS(f'Universities updated: {updated}'))

    def update_scholarships(self):
        schol_data = [
            {
                'title': 'Chinese Government Scholarship (CSC) 2026/2027',
                'description': 'The Chinese Government Scholarship (CGS) is established by the Ministry of Education of China to support international students pursuing undergraduate, master\'s, doctoral, and general/senior scholar programs at Chinese universities. It covers tuition, accommodation, living stipend, and comprehensive medical insurance.',
                'type': 'full', 'level': 'master',
                'eligibility_criteria': 'Citizen of a country other than China, in good health. Bachelor\'s degree holder under age 35 for master\'s. HSK Level 4 for Chinese-taught programs. Must meet university admission requirements.',
                'application_deadline': '2026-02-08',
                'application_link': 'https://www.campuschina.org',
                'required_documents': ['Application Form', 'Passport copy', 'Highest diploma', 'Academic transcripts', 'Study plan (1000+ words)', 'Two recommendation letters', 'Physical examination form', 'HSK score report (if applicable)', 'Pre-admission documents'],
                'application_instructions': 'Apply online at campuschina.org before the deadline. Obtain pre-admission from target university first. Submit all required documents through the CSC system. Embassies conduct interviews in February.',
                'contact_email': 'dispatch@csc.edu.cn',
                'language': 'English/Chinese', 'duration': '1-4 years',
                'start_date': '2026-09-01', 'end_date': '2027-07-15',
                'required_education_level': 'Bachelor\'s degree for master\'s programs',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Tsinghua University International Freshman Scholarship 2026',
                'description': 'Tsinghua University offers International Undergraduate Freshman Scholarships to support outstanding international students. Approximately 45% of international freshmen receive financial support for their first academic year, including full-tuition, half-tuition, and partial-tuition options.',
                'type': 'full', 'level': 'bachelor',
                'eligibility_criteria': 'International students applying for undergraduate programs at Tsinghua University. Academic excellence required. Non-Chinese citizens. Must meet Tsinghua admission requirements.',
                'application_deadline': '2026-02-15',
                'application_link': 'https://international.join-tsinghua.edu.cn',
                'required_documents': ['Application form', 'Passport copy', 'High school diploma', 'Academic transcripts', 'Personal statement', 'Recommendation letters', 'English proficiency certificate'],
                'application_instructions': 'Apply through Tsinghua International Student Admissions. Submit online application at international.join-tsinghua.edu.cn. Scholarship is awarded based on academic merit.',
                'contact_email': ' admission@tsinghua.edu.cn',
                'language': 'English/Chinese', 'duration': '4 years',
                'start_date': '2026-09-01', 'end_date': '2030-07-15',
                'required_education_level': 'High school graduate',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Peking University International Graduate Scholarship 2026',
                'description': 'Peking University offers scholarships for international graduate students including Chinese Government Scholarship, Peking University Scholarship (PKUS), and Beijing Government Scholarship (BGS). Apply once and be considered for multiple scholarship categories.',
                'type': 'full', 'level': 'master',
                'eligibility_criteria': 'Must meet PKU international student admission requirements. Must submit application for full-time self-funded graduate programs. Not receiving other scholarship funding. One application considered for all scholarship types.',
                'application_deadline': '2026-03-17',
                'application_link': 'http://www.studyatpku.com',
                'required_documents': ['Online application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Two recommendation letters', 'CV', 'English proficiency certificate'],
                'application_instructions': 'Submit one application through PKU International Student Service System (studyatpku.com). Also apply through CSC system for Chinese Government Scholarship by March 17, 2026. Award decisions announced July-August 2026.',
                'contact_email': 'study@pku.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Zhejiang University International Student Scholarship 2026',
                'description': 'Zhejiang University offers multiple scholarships including CSC Type A/B, Zhejiang Government Scholarship, and university-specific scholarships. Programs available in English and Chinese across all degree levels.',
                'type': 'full', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens in good health. Bachelor\'s degree for master\'s programs. English-taught programs require IELTS 6.5+ or TOEFL 90+. Chinese-taught programs require HSK 4+.',
                'application_deadline': '2026-02-28',
                'application_link': 'https://iczu.zju.edu.cn',
                'required_documents': ['Online application', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Two recommendation letters', 'Physical examination', 'Language proficiency certificate'],
                'application_instructions': 'Apply through ZJU Online Application System before deadline. Pay application fee. For CSC scholarships, also apply through CSC system with ZJU agency number 10335. Application fee: 800 RMB.',
                'contact_email': 'iczu@zju.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Fudan University Scholarship for International Students 2026',
                'description': 'Fudan University offers Chinese Government Scholarship, Confucius Institute Scholarship, and Shanghai Government Scholarship to international students pursuing degrees at one of China\'s most prestigious universities in Shanghai.',
                'type': 'partial', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens. Meet Fudan admission requirements. Bachelor\'s degree for master\'s programs. English proficiency for English-taught programs or HSK for Chinese-taught.',
                'application_deadline': '2026-03-31',
                'application_link': 'https://www.fudan.edu.cn/en/Scholarships/list.htm',
                'required_documents': ['Application form', 'Passport copy', 'Academic transcripts', 'Degree certificates', 'Study plan', 'Recommendation letters', 'Language certificate'],
                'application_instructions': 'Apply through Fudan International Students Online Application System. Submit application before deadline. Selected candidates will be notified by July 2026.',
                'contact_email': 'iso@fudan.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Shanghai Jiao Tong University International Student Scholarship 2026',
                'description': 'SJTU offers various scholarships for international students including Chinese Government Scholarship, SJTU Scholarship, and Shanghai Government Scholarship covering tuition, accommodation, and living expenses.',
                'type': 'full', 'level': 'phd',
                'eligibility_criteria': 'Non-Chinese citizens. Master\'s degree for PhD programs. Meet SJTU admission requirements. English proficiency for English-taught programs.',
                'application_deadline': '2026-03-15',
                'application_link': 'https://www.sjtu.edu.cn',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Research proposal', 'Three recommendation letters', 'CV'],
                'application_instructions': 'Apply through SJTU International Student Application System. For CSC, also apply through campuschina.org. Contact department for specific requirements.',
                'contact_email': 'iso@sjtu.edu.cn',
                'language': 'English/Chinese', 'duration': '4 years',
                'start_date': '2026-09-01', 'end_date': '2030-07-15',
                'required_education_level': 'Master\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Wuhan University International Student Scholarship 2026',
                'description': 'Wuhan University offers Chinese Government Scholarship, Wuhan University Scholarship, and Hubei Government Scholarship for international students across all degree levels.',
                'type': 'partial', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens in good health. Bachelor\'s degree for master\'s programs. Meet WHU admission requirements.',
                'application_deadline': '2026-04-30',
                'application_link': 'https://www.whu.edu.cn',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Recommendation letters', 'Physical examination form'],
                'application_instructions': 'Apply through WHU International Student Online Application System before deadline. Submit all documents online.',
                'contact_email': 'admission@whu.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Chinese Government Scholarship - Type B (University Program) 2026',
                'description': 'The Chinese Government Scholarship Chinese University Program (Type B) is a full scholarship program established by the Ministry of Education of China. Chinese universities are entrusted to recruit full-time postgraduate students globally.',
                'type': 'full', 'level': 'phd',
                'eligibility_criteria': 'Non-Chinese citizens. Master\'s degree for PhD programs under age 40. Must be pre-admitted by the university. HSK Level 4 for Chinese-taught programs.',
                'application_deadline': '2025-12-31',
                'application_link': 'https://www.campuschina.org',
                'required_documents': ['CSC application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Research proposal', 'Two recommendation letters', 'Pre-admission documents', 'Physical examination form'],
                'application_instructions': 'First obtain pre-admission from target university. Apply through CSC system (agency number varies by university). Deadline varies by university. Results announced July-August 2026.',
                'contact_email': 'dispatch@csc.edu.cn',
                'language': 'English/Chinese', 'duration': '3-4 years',
                'start_date': '2026-09-01', 'end_date': '2030-07-15',
                'required_education_level': 'Master\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Harbin Institute of Technology International Student Scholarship 2026',
                'description': 'HIT offers Chinese Government Scholarship and HIT Presidential Scholarship for international students. Known for engineering and technology programs, HIT provides world-class research facilities in Harbin.',
                'type': 'full', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens. Bachelor\'s degree for master\'s programs. Good academic standing. English or Chinese proficiency depending on program.',
                'application_deadline': '2026-03-31',
                'application_link': 'https://www.hit.edu.cn',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Recommendation letters', 'Language certificate'],
                'application_instructions': 'Apply through HIT International Student Application System. For CSC Type B, apply through campuschina.org with HIT agency number 10213.',
                'contact_email': 'iso@hit.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Nanjing University International Student Scholarship 2026',
                'description': 'Nanjing University offers various scholarships including Chinese Government Scholarship, NJU Scholarship, and Jiangsu Government Scholarship for international students pursuing degrees at one of China\'s oldest universities.',
                'type': 'partial', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens in good health. Bachelor\'s degree for master\'s programs. Meet NJU admission requirements. Language proficiency as required.',
                'application_deadline': '2026-04-15',
                'application_link': 'https://www.nju.edu.cn/english/',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Two recommendation letters', 'Language certificate'],
                'application_instructions': 'Apply through NJU International Student Online Application System. Submit complete application before deadline.',
                'contact_email': 'study@nju.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Sun Yat-sen University International Student Scholarship 2026',
                'description': 'SYSU offers Chinese Government Scholarship, SYSU Scholarship, and Guangdong Government Scholarship for international students. Located in Guangzhou with multiple campuses offering diverse programs.',
                'type': 'partial', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens. Bachelor\'s degree for master\'s programs. Meet SYSU admission requirements. English or Chinese proficiency.',
                'application_deadline': '2026-04-30',
                'application_link': 'https://www.sysu.edu.cn/english/',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Recommendation letters', 'Physical examination form'],
                'application_instructions': 'Apply through SYSU International Student Application System before deadline.',
                'contact_email': 'iso@mail.sysu.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Sichuan University International Student Scholarship 2026',
                'description': 'Sichuan University offers Chinese Government Scholarship, SCU Scholarship, and Sichuan Government Scholarship for international students. Located in Chengdu, one of China\'s most livable cities.',
                'type': 'partial', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens. Bachelor\'s degree for master\'s programs. Meet SCU admission requirements.',
                'application_deadline': '2026-04-15',
                'application_link': 'https://www.scu.edu.cn/',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Recommendation letters'],
                'application_instructions': 'Apply through SCU International Student Application System. Submit before deadline.',
                'contact_email': 'iso@scu.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': False, 'is_active': True,
            },
            {
                'title': 'Xiamen University International Student Scholarship 2026',
                'description': 'XMU offers Chinese Government Scholarship, XMU Scholarship, and Fujian Government Scholarship for international students. Known for its beautiful campus overlooking the sea in Xiamen.',
                'type': 'partial', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens. Bachelor\'s degree for master\'s programs. Meet XMU admission requirements.',
                'application_deadline': '2026-04-30',
                'application_link': 'https://www.xmu.edu.cn/',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Recommendation letters'],
                'application_instructions': 'Apply through XMU International Student Application System.',
                'contact_email': 'admissions@xmu.edu.cn',
                'language': 'English/Chinese', 'duration': '2-3 years',
                'start_date': '2026-09-01', 'end_date': '2029-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': False, 'is_active': True,
            },
            {
                'title': 'BLCU Chinese Language Scholarship 2026',
                'description': 'Beijing Language and Culture University offers Chinese language scholarships for international students. BLCU is the only university in China dedicated to teaching Chinese to international students.',
                'type': 'partial', 'level': 'other',
                'eligibility_criteria': 'Non-Chinese citizens. High school diploma or equivalent. Good health. No HSK required for beginner level.',
                'application_deadline': '2026-06-30',
                'application_link': 'https://www.blcu.edu.cn/',
                'required_documents': ['Application form', 'Passport copy', 'Highest diploma', 'Physical examination form', 'Passport-sized photos'],
                'application_instructions': 'Apply through BLCU International Students Online Application. Semester programs start in March and September.',
                'contact_email': 'iso@blcu.edu.cn',
                'language': 'Chinese', 'duration': '6 months - 2 years',
                'start_date': '2026-09-01', 'end_date': '2027-07-15',
                'required_education_level': 'High school',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Beijing Government Scholarship 2026',
                'description': 'The Beijing Government Scholarship (BGS) is established by Beijing Municipal Government to support international students studying at Beijing universities. Covers partial or full tuition waiver.',
                'type': 'partial', 'level': 'bachelor',
                'eligibility_criteria': 'Non-Chinese citizens studying at Beijing universities. Good academic standing. Not receiving other Chinese government scholarships.',
                'application_deadline': '2026-03-31',
                'application_link': 'http://www.bjedu.gov.cn',
                'required_documents': ['Application form', 'Passport copy', 'Academic transcripts', 'Study plan', 'Recommendation letters'],
                'application_instructions': 'Apply through your university\'s international student office. Universities nominate candidates for BGS.',
                'contact_email': '',
                'language': 'English/Chinese', 'duration': '1-4 years',
                'start_date': '2026-09-01', 'end_date': '2027-07-15',
                'required_education_level': 'Varies by level',
                'is_featured': False, 'is_active': True,
            },
            {
                'title': 'Shanghai Government Scholarship for International Students 2026',
                'description': 'The Shanghai Government Scholarship (SGS) is established by Shanghai Municipal Government to attract international students to study in Shanghai. Covers full or partial tuition.',
                'type': 'partial', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens studying at Shanghai universities. Good academic standing. Not receiving other scholarships.',
                'application_deadline': '2026-04-30',
                'application_link': 'https://www.shanghai.gov.cn',
                'required_documents': ['Application form', 'Passport copy', 'Degree certificates', 'Academic transcripts', 'Study plan', 'Recommendation letters'],
                'application_instructions': 'Apply through your Shanghai university\'s international student office.',
                'contact_email': '',
                'language': 'English/Chinese', 'duration': '1-3 years',
                'start_date': '2026-09-01', 'end_date': '2027-07-15',
                'required_education_level': 'Varies by level',
                'is_featured': False, 'is_active': True,
            },
            {
                'title': 'Asian Future Leaders Scholarship Program (AFLSP) 2026',
                'description': 'Offered by Bai Xian Asia Institute, AFLSP provides scholarships for outstanding Asian students to pursue master\'s degrees at top East Asian universities including Tsinghua University. Covers tuition fees and living allowance for 1-2 years.',
                'type': 'full', 'level': 'master',
                'eligibility_criteria': 'Non-Chinese citizens from Asia. Academic excellence. Leadership potential. Good command of English. Interest in international and intercultural understanding. Not receiving other scholarships.',
                'application_deadline': '2026-03-01',
                'application_link': 'https://yz.tsinghua.edu.cn/en/info/1027/1477.htm',
                'required_documents': ['Online application to Tsinghua master\'s program', 'AFLSP application materials', 'Academic transcripts', 'CV', 'Personal statement', 'Recommendation letters'],
                'application_instructions': 'First apply for 2026 master\'s program at Tsinghua. Submit AFLSP scholarship application materials to department by March 1, 2026. Results announced end of May 2026.',
                'contact_email': '',
                'language': 'English', 'duration': '1-2 years',
                'start_date': '2026-09-01', 'end_date': '2028-07-15',
                'required_education_level': 'Bachelor\'s degree',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Confucius Institute Scholarship 2026',
                'description': 'The Confucius Institute Scholarship supports international students to study Chinese language and culture at Chinese universities. Covers tuition, accommodation, living stipend, and insurance.',
                'type': 'full', 'level': 'other',
                'eligibility_criteria': 'Non-Chinese citizens. Age 16-35 (under 45 for scholars). HSK Level 3+ for most programs. Good health.',
                'application_deadline': '2026-05-31',
                'application_link': 'https://www.chinese.cn/scholarship',
                'required_documents': ['Application form', 'Passport copy', 'HSK score report', 'Degree certificates', 'Academic transcripts', 'Recommendation letters'],
                'application_instructions': 'Apply through Confucius Institute Scholarship online system at chinese.cn. Submit before May 31, 2026.',
                'contact_email': 'chinese@chinese.cn',
                'language': 'Chinese', 'duration': '1-2 years',
                'start_date': '2026-09-01', 'end_date': '2027-07-15',
                'required_education_level': 'Varies by program',
                'is_featured': True, 'is_active': True,
            },
            {
                'title': 'Beijing Language and Culture University Language Program 2026',
                'description': 'BLCU offers intensive Chinese language programs for international students at all levels from beginner to advanced. Includes optional homestay with Chinese families for cultural immersion.',
                'type': 'partial', 'level': 'other',
                'eligibility_criteria': 'Non-Chinese citizens. High school diploma or equivalent. Any language level welcome.',
                'application_deadline': '2026-08-15',
                'application_link': 'https://www.blcu.edu.cn/',
                'required_documents': ['Application form', 'Passport copy', 'Highest diploma', 'Physical examination form'],
                'application_instructions': 'Apply through BLCU online system. Programs start in March and September each year.',
                'contact_email': 'iso@blcu.edu.cn',
                'language': 'Chinese', 'duration': '4 weeks - 1 year',
                'start_date': '2026-09-01', 'end_date': '2027-07-15',
                'required_education_level': 'High school',
                'is_featured': False, 'is_active': True,
            },
        ]

        # Get existing scholarships to avoid duplicates by title
        existing_titles = set(Scholarship.objects.values_list('title', flat=True))
        created = 0
        updated = 0

        for data in schol_data:
            title = data['title']
            if title in existing_titles:
                # Update existing
                sch = Scholarship.objects.get(title=title)
                for field, value in data.items():
                    if field in ['application_deadline', 'start_date', 'end_date']:
                        if value:
                            try:
                                parsed = timezone.make_aware(
                                    timezone.datetime.strptime(value, '%Y-%m-%d'),
                                    timezone.get_current_timezone()
                                )
                                setattr(sch, field, parsed)
                            except ValueError:
                                pass
                    elif hasattr(sch, field):
                        setattr(sch, field, value)
                sch.save()
                updated += 1
                self.stdout.write(f'  Updated: {title}')
            else:
                # Create new
                kwargs = {}
                for field, value in data.items():
                    if field in ['application_deadline', 'start_date', 'end_date']:
                        if value:
                            try:
                                kwargs[field] = timezone.make_aware(
                                    timezone.datetime.strptime(value, '%Y-%m-%d'),
                                    timezone.get_current_timezone()
                                )
                            except ValueError:
                                kwargs[field] = None
                    else:
                        kwargs[field] = value

                # Assign to first university or matching university
                uni = University.objects.first()
                kwargs['university'] = uni

                Scholarship.objects.create(**kwargs)
                created += 1
                self.stdout.write(f'  Created: {title}')

        self.stdout.write(self.style.SUCCESS(
            f'Scholarships: {created} created, {updated} updated'
        ))
