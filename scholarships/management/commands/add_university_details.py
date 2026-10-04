from django.core.management.base import BaseCommand
from scholarships.models import University


class Command(BaseCommand):
    help = 'Add real addresses, founding years and mottos to universities'

    def handle(self, *args, **options):
        data = {
            'Tsinghua University': {
                'address': '1 Tsinghua Yuan, Haidian District, Beijing 100084, China',
                'founding_year': 1911,
                'motto': '自强不息，厚德载物 (Self-discipline and Social Commitment)',
            },
            'Peking University': {
                'address': '5 Yiheyuan Road, Haidian District, Beijing 100871, China',
                'founding_year': 1898,
                'motto': '爱国、进步、民主、科学 (Patriotism, Progress, Democracy, Science)',
            },
            'Fudan University': {
                'address': '220 Handan Road, Yangpu District, Shanghai 200433, China',
                'founding_year': 1905,
                'motto': '博学而笃志，切问而近思',
            },
            'Shanghai Jiao Tong University': {
                'address': '800 Dongchuan Road, Minhang District, Shanghai 200240, China',
                'founding_year': 1896,
                'motto': '饮水思源，爱国荣校',
            },
            'Zhejiang University': {
                'address': '38 Zheda Road, Xihu District, Hangzhou 310058, China',
                'founding_year': 1897,
                'motto': '求是创新 (Seeking Truth and Innovation)',
            },
            'Nanjing University': {
                'address': '163 Xianlin Road, Qixia District, Nanjing 210023, China',
                'founding_year': 1902,
                'motto': '诚朴雄伟，励学敦行',
            },
            'Wuhan University': {
                'address': '299 Bayi Road, Wuchang District, Wuhan 430072, China',
                'founding_year': 1893,
                'motto': '自强、弘毅、求是、拓新',
            },
            'Huazhong University of Science and Technology': {
                'address': '1037 Luoyu Road, Hongshan District, Wuhan 430074, China',
                'founding_year': 1952,
                'motto': '明德厚学，求是创新',
            },
            'HUST': {
                'address': '1037 Luoyu Road, Hongshan District, Wuhan 430074, China',
                'founding_year': 1952,
                'motto': '明德厚学，求是创新',
            },
            'Sun Yat-sen University': {
                'address': '135 Xingang Road West, Haizhu District, Guangzhou 510275, China',
                'founding_year': 1924,
                'motto': '博学、审问、慎思、明辨、笃行',
            },
            'Harbin Institute of Technology': {
                'address': '92 West Dazhi Street, Nangang District, Harbin 150001, China',
                'founding_year': 1920,
                'motto': '规格严格，功夫到家',
            },
            'HIT': {
                'address': '92 West Dazhi Street, Nangang District, Harbin 150001, China',
                'founding_year': 1920,
                'motto': '规格严格，功夫到家',
            },
            'Beihang University': {
                'address': '37 Xueyuan Road, Haidian District, Beijing 100191, China',
                'founding_year': 1952,
                'motto': '德才兼备，知行合一',
            },
            'Beijing Normal University': {
                'address': '19 Xinjiekouwai Street, Haidian District, Beijing 100875, China',
                'founding_year': 1902,
                'motto': '学为人师，行为世范',
            },
            'Tongji University': {
                'address': '1239 Siping Road, Yangpu District, Shanghai 200092, China',
                'founding_year': 1907,
                'motto': '同舟共济',
            },
            'Sichuan University': {
                'address': '29 Wangjiang Road, Wuhou District, Chengdu 610064, China',
                'founding_year': 1896,
                'motto': '海纳百川，有容乃大',
            },
            'Shandong University': {
                'address': '72 Wenhua Xili, Lixia District, Jinan 250100, China',
                'founding_year': 1901,
                'motto': '学无止境，气有浩然',
            },
            'Xi\'an Jiaotong University': {
                'address': '28 Xianning West Road, Xi\'an 710049, China',
                'founding_year': 1896,
                'motto': '精勤求学，敦笃励志，果毅力行，忠恕任事',
            },
            'Jilin University': {
                'address': '2699 Qianjin Street, Chaoyang District, Changchun 130012, China',
                'founding_year': 1946,
                'motto': '求实创新，励志图强',
            },
            'Nankai University': {
                'address': '94 Weijin Road, Nankai District, Tianjin 300071, China',
                'founding_year': 1919,
                'motto': '允公允能，日新月异',
            },
            'Tianjin University': {
                'address': '92 Weijin Road, Nankai District, Tianjin 300072, China',
                'founding_year': 1895,
                'motto': '实事求是',
            },
            'Dalian University of Technology': {
                'address': '2 Linggong Road, Ganjingzi District, Dalian 116024, China',
                'founding_year': 1949,
                'motto': '团结、进取、求实、创新',
            },
            'Xiamen University': {
                'address': '422 Siming South Road, Siming District, Xiamen 361005, China',
                'founding_year': 1921,
                'motto': '自强不息，止于至善',
            },
            'Beijing Institute of Technology': {
                'address': '5 South Zhongguancun Street, Haidian District, Beijing 100081, China',
                'founding_year': 1940,
                'motto': '团结、勤奋、求实、创新',
            },
            'China Agricultural University': {
                'address': '17 Qinghua East Road, Haidian District, Beijing 100083, China',
                'founding_year': 1905,
                'motto': '解民生之多艰，育天下之英才',
            },
            'Central South University': {
                'address': '932 Lushan South Road, Yuelu District, Changsha 410083, China',
                'founding_year': 2000,
                'motto': '经世致用',
            },
            'Lanzhou University': {
                'address': '222 Tianshui South Road, Chengguan District, Lanzhou 730000, China',
                'founding_year': 1909,
                'motto': '勤奋、求实、创新、进取',
            },
            'Southeast University': {
                'address': '2 Sipailou, Nanjing 210096, China',
                'founding_year': 1902,
                'motto': '止于至善',
            },
            'Jinan University': {
                'address': '601 Huangpu Avenue West, Tianhe District, Guangzhou 510632, China',
                'founding_year': 1906,
                'motto': '忠信笃敬',
            },
            'Chongqing University': {
                'address': '174 Shazheng Street, Shapingba District, Chongqing 400044, China',
                'founding_year': 1929,
                'motto': '耐劳苦、尚俭朴、勤学业、爱国家',
            },
            'Hunan University': {
                'address': '2 Lushan South Road, Yuelu District, Changsha 410082, China',
                'founding_year': 976,
                'motto': '实事求是，敢为人先',
            },
            'Soochow University': {
                'address': '1 Shizi Street, Suzhou 215006, China',
                'founding_year': 1900,
                'motto': '养天地正气，法古今完人',
            },
            'Beijing Foreign Studies University': {
                'address': '19 Xisanhuan North Road, Haidian District, Beijing 100089, China',
                'founding_year': 1941,
                'motto': '兼容并蓄，博学笃行',
            },
            'BFSU': {
                'address': '19 Xisanhuan North Road, Haidian District, Beijing 100089, China',
                'founding_year': 1941,
                'motto': '兼容并蓄，博学笃行',
            },
            'Beijing Language and Culture University': {
                'address': '15 Xueyuan Road, Haidian District, Beijing 100083, China',
                'founding_year': 1962,
                'motto': '德行言语，敦睦天下',
            },
            'BLCU': {
                'address': '15 Xueyuan Road, Haidian District, Beijing 100083, China',
                'founding_year': 1962,
                'motto': '德行言语，敦睦天下',
            },
            'East China Normal University': {
                'address': '500 Dongchuan Road, Minhang District, Shanghai 200241, China',
                'founding_year': 1951,
                'motto': '求实创造，为人师表',
            },
            'ECNU': {
                'address': '500 Dongchuan Road, Minhang District, Shanghai 200241, China',
                'founding_year': 1951,
                'motto': '求实创造，为人师表',
            },
            'UCAS': {
                'address': '19A Yuquan Road, Haidian District, Beijing 100049, China',
                'founding_year': 1978,
                'motto': '博学笃志，格物明德',
            },
            'South China University of Technology': {
                'address': '381 Wushan Road, Tianhe District, Guangzhou 510641, China',
                'founding_year': 1952,
                'motto': '博学慎思，明辨笃行',
            },
            'SCUT': {
                'address': '381 Wushan Road, Tianhe District, Guangzhou 510641, China',
                'founding_year': 1952,
                'motto': '博学慎思，明辨笃行',
            },
            'Shanghai Maritime University': {
                'address': '1550 Haigang Avenue, Pudong New District, Shanghai 201306, China',
                'founding_year': 1909,
                'motto': '忠信笃敬',
            },
            'Donghua University': {
                'address': '1299 Yan\'an West Road, Changning District, Shanghai 200051, China',
                'founding_year': 1951,
                'motto': '崇德博学，砺志尚实',
            },
            'Shanghai University': {
                'address': '36 Zhuyu Road, Baoshan District, Shanghai 200444, China',
                'founding_year': 1922,
                'motto': '自强不息',
            },
            'Southwest Jiaotong University': {
                'address': '111 First Section of North Second Ring Road, Chengdu 610031, China',
                'founding_year': 1896,
                'motto': '竢实扬华，自强不息',
            },
            'Central University of Finance and Economics': {
                'address': '39 Xueyuan North Road, Haidian District, Beijing 100081, China',
                'founding_year': 1949,
                'motto': '德才兼备，知行合一',
            },
            'CUFE': {
                'address': '39 Xueyuan North Road, Haidian District, Beijing 100081, China',
                'founding_year': 1949,
                'motto': '德才兼备，知行合一',
            },
            'Nanjing University of Science and Technology': {
                'address': '200 Xiaolingwei, Nanjing 210094, China',
                'founding_year': 1953,
                'motto': '进德修业，志道鼎新',
            },
            'NJUST': {
                'address': '200 Xiaolingwei, Nanjing 210094, China',
                'founding_year': 1953,
                'motto': '进德修业，志道鼎新',
            },
            'University of Electronic Science and Technology of China': {
                'address': '2006 Xiyuan Avenue, West Zone, Chengdu 611731, China',
                'founding_year': 1956,
                'motto': '求实求真，大气大为',
            },
            'UESTC': {
                'address': '2006 Xiyuan Avenue, West Zone, Chengdu 611731, China',
                'founding_year': 1956,
                'motto': '求实求真，大气大为',
            },
            'Northwestern Polytechnical University': {
                'address': '127 West Youyi Road, Xi\'an 710072, China',
                'founding_year': 1938,
                'motto': '公诚勇毅',
            },
            'NPU': {
                'address': '127 West Youyi Road, Xi\'an 710072, China',
                'founding_year': 1938,
                'motto': '公诚勇毅',
            },
            'Wuhan University of Technology': {
                'address': '122 Luoshi Road, Hongshan District, Wuhan 430070, China',
                'founding_year': 1898,
                'motto': '厚德博学，追求卓越',
            },
            'WHUT': {
                'address': '122 Luoshi Road, Hongshan District, Wuhan 430070, China',
                'founding_year': 1898,
                'motto': '厚德博学，追求卓越',
            },
            'Northeast Forestry University': {
                'address': '26 Hexing Road, Xiangfang District, Harbin 150040, China',
                'founding_year': 1952,
                'motto': '学参天地，德合自然',
            },
            'NEFU': {
                'address': '26 Hexing Road, Xiangfang District, Harbin 150040, China',
                'founding_year': 1952,
                'motto': '学参天地，德合自然',
            },
            'Hohai University': {
                'address': '1 Xikang Road, Nanjing 210098, China',
                'founding_year': 1915,
                'motto': '艰苦朴素，实事求是，严格要求，勇于探索',
            },
            'Nanjing Normal University': {
                'address': '1 Wenyuan Road, Xianlin, Nanjing 210023, China',
                'founding_year': 1902,
                'motto': '正德厚生，笃学敏行',
            },
            'NNU': {
                'address': '1 Wenyuan Road, Xianlin, Nanjing 210023, China',
                'founding_year': 1902,
                'motto': '正德厚生，笃学敏行',
            },
            'South China Normal University': {
                'address': '55 Zhongshan Avenue West, Tianhe District, Guangzhou 510631, China',
                'founding_year': 1933,
                'motto': '艰苦奋斗、严谨治学、求实创新、为人师表',
            },
            'SCNU': {
                'address': '55 Zhongshan Avenue West, Tianhe District, Guangzhou 510631, China',
                'founding_year': 1933,
                'motto': '艰苦奋斗、严谨治学、求实创新、为人师表',
            },
            'Guangdong University of Technology': {
                'address': '100 Jincheng Road, Yuexiu District, Guangzhou 510006, China',
                'founding_year': 1958,
                'motto': '团结、勤奋、求是、创新',
            },
            'GDUT': {
                'address': '100 Jincheng Road, Yuexiu District, Guangzhou 510006, China',
                'founding_year': 1958,
                'motto': '团结、勤奋、求是、创新',
            },
            'Beijing International Studies University': {
                'address': '1 Wanhang Road, Chaoyang District, Beijing 100029, China',
                'founding_year': 1964,
                'motto': '弘毅、勤奋、务实、创新',
            },
            'BISU': {
                'address': '1 Wanhang Road, Chaoyang District, Beijing 100029, China',
                'founding_year': 1964,
                'motto': '弘毅、勤奋、务实、创新',
            },
            'Shanghai International Studies University': {
                'address': '550 Dalian West Road, Yangpu District, Shanghai 200083, China',
                'founding_year': 1949,
                'motto': '格高志远，学贯中外',
            },
            'SISU': {
                'address': '550 Dalian West Road, Yangpu District, Shanghai 200083, China',
                'founding_year': 1949,
                'motto': '格高志远，学贯中外',
            },
            'Guangdong Medical University': {
                'address': 'Xinzhou South Road 1, Dongguan 523808, China',
                'founding_year': 1958,
                'motto': '立志立德，求真求精',
            },
            'GMU': {
                'address': 'Xinzhou South Road 1, Dongguan 523808, China',
                'founding_year': 1958,
                'motto': '立志立德，求真求精',
            },
            'Guangdong University of Foreign Studies': {
                'address': '2 Guangdong Boulevard North, Baiyun District, Guangzhou 510420, China',
                'founding_year': 1965,
                'motto': '明德尚行，学贯中西',
            },
            'GDUFS': {
                'address': '2 Guangdong Boulevard North, Baiyun District, Guangzhou 510420, China',
                'founding_year': 1965,
                'motto': '明德尚行，学贯中西',
            },
            'Nanjing University of Posts and Telecommunications': {
                'address': '66 Xinmofan Road, Nanjing 210003, China',
                'founding_year': 1942,
                'motto': '博学、笃志、明德、力行',
            },
            'NJUPT': {
                'address': '66 Xinmofan Road, Nanjing 210003, China',
                'founding_year': 1942,
                'motto': '博学、笃志、明德、力行',
            },
            'Northwest A&F University': {
                'address': '3 Taicheng Road, Yangling, Shaanxi 712100, China',
                'founding_year': 1934,
                'motto': '诚朴勇毅',
            },
            'NWAFU': {
                'address': '3 Taicheng Road, Yangling, Shaanxi 712100, China',
                'founding_year': 1934,
                'motto': '诚朴勇毅',
            },
            'Southwest University of Finance and Economics': {
                'address': '55 Guanghuacun Street, Chengdu 610074, China',
                'founding_year': 1925,
                'motto': '济世、兴邦',
            },
            'SUFE': {
                'address': '55 Guanghuacun Street, Chengdu 610074, China',
                'founding_year': 1925,
                'motto': '济世、兴邦',
            },
            'Chengdu University of Technology': {
                'address': '4 Nanchong Road, Chenghua District, Chengdu 610059, China',
                'founding_year': 1956,
                'motto': '穷究于理，成就于工',
            },
            'CDUT': {
                'address': '4 Nanchong Road, Chenghua District, Chengdu 610059, China',
                'founding_year': 1956,
                'motto': '穷究于理，成就于工',
            },
            'Heilongjiang University': {
                'address': '74 Xuefu Road, Nangang District, Harbin 150080, China',
                'founding_year': 1941,
                'motto': '博学慎思，参天尽物',
            },
            'HLJU': {
                'address': '74 Xuefu Road, Nangang District, Harbin 150080, China',
                'founding_year': 1941,
                'motto': '博学慎思，参天尽物',
            },
            'Beijing University of Chemical Technology': {
                'address': '15 North Third Ring Road East, Beijing 100029, China',
                'founding_year': 1958,
                'motto': '宏德博学、化育天工',
            },
            'China University of Geosciences': {
                'address': '388 Lumo Road, Hongshan District, Wuhan 430074, China',
                'founding_year': 1952,
                'motto': '艰苦朴素，求真务实',
            },
            'CUGB': {
                'address': '29 Xueyuan Road, Haidian District, Beijing 100083, China',
                'founding_year': 1952,
                'motto': '艰苦朴素，求真务实',
            },
            'Zhongnan University of Economics and Law': {
                'address': '182 Nanhuhuan Road, Hongshan District, Wuhan 430073, China',
                'founding_year': 1948,
                'motto': '博文明理，厚德济世',
            },
            'ZUEL': {
                'address': '182 Nanhuhuan Road, Hongshan District, Wuhan 430073, China',
                'founding_year': 1948,
                'motto': '博文明理，厚德济世',
            },
            'China Scholarship Council': {
                'address': 'Chegongzhuang West Road 12, Haidian District, Beijing 100081, China',
                'founding_year': 1996,
                'motto': 'CSC',
            },
        }

        updated = 0
        for name, info in data.items():
            try:
                uni = University.objects.get(name=name)
                changed = False
                for field, value in info.items():
                    if getattr(uni, field) != value:
                        setattr(uni, field, value)
                        changed = True
                if changed:
                    uni.save()
                    updated += 1
                    self.stdout.write(f'  Updated: {name}')
            except University.DoesNotExist:
                self.stdout.write(f'  Not found: {name}')

        self.stdout.write(self.style.SUCCESS(f'Updated: {updated}'))
