import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarship_backend.settings')
django.setup()

from scholarships.models import University, CampusLandmark

landmarks_data = {
    83: [ # UESTC
        {
            "name": "Qingshuihe Campus Main Building & Library (清水河校区主楼与图书馆)",
            "description": "The monumental postmodern landmark of UESTC Qingshuihe campus, housing extensive engineering and semiconductor collections with expansive water mirror plazas.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/UESTC_Qingshuihe_Campus_Main_Building.jpg/1280px-UESTC_Qingshuihe_Campus_Main_Building.jpg",
            "category": "academic",
            "order": 1
        },
        {
            "name": "Golden Ginkgo Avenue (银杏大道)",
            "description": "Famous throughout Chengdu, every autumn over 1,600 mature ginkgo trees create a breathtaking golden canopy where students and visitors gather.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Ginkgo_trees_in_UESTC_201311.jpg/1280px-Ginkgo_trees_in_UESTC_201311.jpg",
            "category": "nature",
            "order": 2
        },
        {
            "name": "Shahe Campus Historic South Gate (沙河校区南门)",
            "description": "The historic campus gate in central Chengdu representing the university's founding legacy in 1956 under Premier Zhou Enlai.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/UESTC_Shahe_Campus_South_Gate.jpg/1280px-UESTC_Shahe_Campus_South_Gate.jpg",
            "category": "gate",
            "order": 3
        },
        {
            "name": "West Lake & Swan Pavilion (西湖与黑天鹅)",
            "description": "Scenic campus ecological sanctuary featuring resident black swans, lotus waterways, and outdoor student study terraces.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/UESTC_Qingshuihe_Campus_Lake.jpg/1280px-UESTC_Qingshuihe_Campus_Lake.jpg",
            "category": "nature",
            "order": 4
        }
    ],
    84: [ # SWUFE
        {
            "name": "Liulin Campus Grand Bell Tower & Library (柳林校区钟楼与图书馆)",
            "description": "The towering neoclassical clock tower rising above Western China's foremost financial university campus, overlooking the central academic quad.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/SWUFE_Liulin_Campus_Library.jpg/1280px-SWUFE_Liulin_Campus_Library.jpg",
            "category": "academic",
            "order": 1
        },
        {
            "name": "Guanghua Campus Historic North Gate (光华校区北门)",
            "description": "Historic gateway founded in 1925 in Chengdu, commemorating the university's origins in modern Chinese economics and banking.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/SWUFE_Guanghua_Campus.jpg/1280px-SWUFE_Guanghua_Campus.jpg",
            "category": "gate",
            "order": 2
        },
        {
            "name": "Financial Museum & Academic Commons (钱币博物馆与金融学院楼)",
            "description": "Prestigious research center featuring ancient and modern currency exhibits alongside high-tech algorithmic trading simulation labs.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/SWUFE_Campus_Building.jpg/1280px-SWUFE_Campus_Building.jpg",
            "category": "culture",
            "order": 3
        }
    ],
    85: [ # Chengdu University of Technology
        {
            "name": "Chengdu Natural History Museum (成都自然博物馆/成都理工大学博物馆)",
            "description": "One of Asia's largest geological and paleontology museums, displaying world-renowned Mamenchisaurus dinosaur fossils and rare mineral gems.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Chengdu_Natural_History_Museum_2022.jpg/1280px-Chengdu_Natural_History_Museum_2022.jpg",
            "category": "culture",
            "order": 1
        },
        {
            "name": "Main Campus Arch & Yifu Library (主校区逸夫图书馆)",
            "description": "Centerpiece of geological science engineering research in Sichuan, facing the expansive Donghu campus water gardens.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/CDUT_Library.jpg/1280px-CDUT_Library.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    86: [ # BFSU
        {
            "name": "East Campus Globe Plaza & Main Building (东校区主楼与世界广场)",
            "description": "The symbolic entrance to China's 'Cradle of Diplomats', featuring the famous world map paving and international cultural colonnade.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/BFSU_East_Campus_Main_Building.jpg/1280px-BFSU_East_Campus_Main_Building.jpg",
            "category": "gate",
            "order": 1
        },
        {
            "name": "BFSU Modernist Library (北外新图书馆)",
            "description": "Iconic glass-facade library holding books and resources in over 101 world languages, designed with open collaborative reading atriums.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/BFSU_Library_2016.jpg/1280px-BFSU_Library_2016.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    87: [ # CAU
        {
            "name": "East Campus Olympic Gymnasium (中国农业大学体育馆)",
            "description": "The 2008 Beijing Olympic wrestling venue featuring dramatic stepped terracotta-colored roof trusses, now serving student sports and ceremonies.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/China_Agricultural_University_Gymnasium_2008.jpg/1280px-China_Agricultural_University_Gymnasium_2008.jpg",
            "category": "sports",
            "order": 1
        },
        {
            "name": "West Campus Historic Gate & Agricultural Tower (西校区主楼)",
            "description": "Set near the Summer Palace, featuring historic tree-lined avenues and state-of-the-art biological breeding laboratories.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/China_Agricultural_University_West_Campus.jpg/1280px-China_Agricultural_University_West_Campus.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    88: [ # BUPT
        {
            "name": "Xitucheng Campus South Gate & Cyber Quad (西土城校区南门)",
            "description": "Heart of China's telecommunications and computer science education, located along Beijing's vibrant tech corridor.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/BUPT_South_Gate_2020.jpg/1280px-BUPT_South_Gate_2020.jpg",
            "category": "gate",
            "order": 1
        },
        {
            "name": "BUPT Teaching & Innovation Complex (教三楼与科研大楼)",
            "description": "Famous academic landmark where generations of leading network architects and software pioneers studied and innovated.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BUPT_Main_Building_2021.jpg/1280px-BUPT_Main_Building_2021.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    89: [ # CUFE
        {
            "name": "Shahe Campus Landmark Library (沙河校区图书馆)",
            "description": "Striking architectural centerpiece with geometric red stone facades and multi-tiered study gallerias, serving finance and economic scholars.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/CUFE_Shahe_Library.jpg/1280px-CUFE_Shahe_Library.jpg",
            "category": "academic",
            "order": 1
        },
        {
            "name": "South Campus Historic Gate & Central Plaza (南路校区正门与主教学楼)",
            "description": "Located in Haidian district, this urban campus has educated China's premier banking, taxation, and treasury officials since 1949.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/CUFE_South_Campus_Gate.jpg/1280px-CUFE_South_Campus_Gate.jpg",
            "category": "gate",
            "order": 2
        }
    ],
    90: [ # BJUT
        {
            "name": "Beijing Olympic Badminton Gymnasium (北京工业大学奥林匹克体育馆)",
            "description": "Famous for the largest suspended steel dome roof in China, hosting global athletics tournaments and university celebrations.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/BJUT_Gymnasium_Olympic.jpg/1280px-BJUT_Gymnasium_Olympic.jpg",
            "category": "sports",
            "order": 1
        },
        {
            "name": "Yifu Library & Technology Square (逸夫图书馆与科技大楼)",
            "description": "Modern engineering library and research park located in southeastern Beijing, equipped with robotics and environmental laboratories.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/BJUT_Library_Building.jpg/1280px-BJUT_Library_Building.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    91: [ # SCUT
        {
            "name": "Wushan Campus Historic Brick Quadrangle (五山校区历史建筑群与励吾科技楼)",
            "description": "Protected national cultural heritage site blending Lingnan and classical Chinese temple roof architecture amidst sub-tropical banyans.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/SCUT_Historic_Main_Building.jpg/1280px-SCUT_Historic_Main_Building.jpg",
            "category": "culture",
            "order": 1
        },
        {
            "name": "West Lake Lotus Promenade (西湖荷塘与水榭)",
            "description": "Tranquil campus lake bordered by weeping willows, arched pavilions, and traditional stone bridges.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/SCUT_West_Lake_Guangzhou.jpg/1280px-SCUT_West_Lake_Guangzhou.jpg",
            "category": "nature",
            "order": 2
        },
        {
            "name": "University Town Campus Modernist Library (大学城校区图书馆)",
            "description": "Futuristic high-tech library situated on Guangzhou Higher Education Mega Center island, surrounded by sports stadiums.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/SCUT_HEMC_Library.jpg/1280px-SCUT_HEMC_Library.jpg",
            "category": "academic",
            "order": 3
        }
    ],
    92: [ # SCNU
        {
            "name": "Shipai Campus Main Arch Gate (石牌校区正门牌坊)",
            "description": "Majestic classical gateway in Tianhe Guangzhou, surrounded by century-old banyan trees and teacher education institutes.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/SCNU_Shipai_Gate.jpg/1280px-SCNU_Shipai_Gate.jpg",
            "category": "gate",
            "order": 1
        },
        {
            "name": "SCNU Grand Library & Green Meadow (华南师范大学图书馆与草坪)",
            "description": "Extensive educational sciences and pedagogy research library facing the lush campus lawn.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SCNU_Library_Shipai.jpg/1280px-SCNU_Library_Shipai.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    93: [ # GDUFS
        {
            "name": "Baiyun Mountain Campus Gate (白云山校区正门)",
            "description": "Nestled against the lush slopes of Mount Baiyun, offering fresh forest mountain air and serene gardens for international language students.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/GDUFS_North_Gate.jpg/1280px-GDUFS_North_Gate.jpg",
            "category": "gate",
            "order": 1
        },
        {
            "name": "Xiangsi Lake & International Plaza (相思湖与国际交流中心)",
            "description": "Picturesque campus lake with arched bridges, swans, and multi-lingual student cultural festivals.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/GDUFS_Xiangsi_Lake.jpg/1280px-GDUFS_Xiangsi_Lake.jpg",
            "category": "nature",
            "order": 2
        }
    ],
    94: [ # Southern Medical University
        {
            "name": "Main Campus Grand Gate & Medical Colonnade (南方医科大学正门与教学主楼)",
            "description": "Formerly the First Military Medical University of the PLA, known for state-of-the-art surgical simulation facilities.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Southern_Medical_University_Main_Gate.jpg/1280px-Southern_Medical_University_Main_Gate.jpg",
            "category": "gate",
            "order": 1
        },
        {
            "name": "Qilin Lake & Tropical Medical Gardens (麒麟湖与医学植物园)",
            "description": "Serene green lakeside oasis with traditional Chinese herbal botanical gardens and waterside pavilions.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/SMU_Guangzhou_Campus.jpg/1280px-SMU_Guangzhou_Campus.jpg",
            "category": "nature",
            "order": 2
        }
    ],
    95: [ # Shenzhen University
        {
            "name": "Yuehai Campus Wenshan Lake (文山湖与汇星楼)",
            "description": "Legendary campus lake where Tencent founder Pony Ma and tech entrepreneurs studied, surrounded by modern glass towers and tropical palms.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Shenzhen_University_Wenshan_Lake.jpg/1280px-Shenzhen_University_Wenshan_Lake.jpg",
            "category": "nature",
            "order": 1
        },
        {
            "name": "Canghai Campus Tech Complex (沧海校区科技楼与致理楼)",
            "description": "Futuristic white architectural complex in Nanshan high-tech hub, featuring artificial intelligence and nanotechnology research institutes.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Shenzhen_University_Canghai_Campus.jpg/1280px-Shenzhen_University_Canghai_Campus.jpg",
            "category": "academic",
            "order": 2
        },
        {
            "name": "South Campus Modernist Library (深圳大学南校区图书馆)",
            "description": "Award-winning brutalist and minimalist glass architecture with multi-tiered reading gardens and innovative collaboration pods.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/SZU_South_Library.jpg/1280px-SZU_South_Library.jpg",
            "category": "academic",
            "order": 3
        }
    ],
    96: [ # SUSTech
        {
            "name": "Dasha River Eco-Campus & Glass Bridge (大沙河生态景观廊道)",
            "description": "World-class university design integrating the natural Dasha River wetlands directly through the research campus.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/SUSTech_Campus_Dasha_River.jpg/1280px-SUSTech_Campus_Dasha_River.jpg",
            "category": "nature",
            "order": 1
        },
        {
            "name": "Yidan Library & Learning Commons (一丹图书馆)",
            "description": "State-of-the-art smart library illuminated by floor-to-ceiling panoramic glass, voted among China's most beautiful campus libraries.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/SUSTech_Yidan_Library.jpg/1280px-SUSTech_Yidan_Library.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    97: [ # CUHK-SZ
        {
            "name": "Upper Campus Clock Tower & Administration Building (上校区钟楼与行政楼)",
            "description": "Architectural icon echoing the hillside Collegiate heritage of The Chinese University of Hong Kong in Shenzhen's Longgang district.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/CUHK_Shenzhen_Campus_2019.jpg/1280px-CUHK_Shenzhen_Campus_2019.jpg",
            "category": "academic",
            "order": 1
        },
        {
            "name": "Million Dollar Way & University Library (百万大道与大学图书馆)",
            "description": "Broad pedestrian ceremonial avenue flanked by Diligentia and Shaw residential colleges and high-tech digital laboratories.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/CUHK_SZ_Million_Dollar_Way.jpg/1280px-CUHK_SZ_Million_Dollar_Way.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    98: [ # WUT
        {
            "name": "Nanhu Campus Modern Library (南湖校区新图书馆)",
            "description": "Massive high-tech library overlooking Nanhu lake, serving Wuhan's premier materials science and transportation engineers.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Wuhan_University_of_Technology_Nanhu_Library.jpg/1280px-Wuhan_University_of_Technology_Nanhu_Library.jpg",
            "category": "academic",
            "order": 1
        },
        {
            "name": "Yujiatou Campus Maritime Navigation Complex (余家头校区航运实验大楼)",
            "description": "Historic naval architecture research center overlooking the Yangtze River, featuring ship simulation control bridges.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/WUT_Yujiatou_Campus.jpg/1280px-WUT_Yujiatou_Campus.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    99: [ # CCNU
        {
            "name": "Guizi Hill Historical Main Building (桂子山老主楼与林荫大道)",
            "description": "Iconic green-glazed roof architecture constructed in 1953 surrounded by over 20,000 sweet osmanthus trees on Guizi Mountain.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/CCNU_Historic_Main_Building.jpg/1280px-CCNU_Historic_Main_Building.jpg",
            "category": "culture",
            "order": 1
        },
        {
            "name": "Nanhu Campus Gateway (南湖校区正门)",
            "description": "Modern lakeside campus extension with international scholar apartments and teacher education innovation centers.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/CCNU_Nanhu_Gate.jpg/1280px-CCNU_Nanhu_Gate.jpg",
            "category": "gate",
            "order": 2
        }
    ],
    100: [ # Xidian
        {
            "name": "South Campus Futuristic Spaceship Library (南校区主楼与图书馆)",
            "description": "Distinctive curved aerodynamic architecture in Xi'an Chang'an district, reflecting Xidian's pioneer status in space radar and cyber electronics.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Xidian_University_South_Campus_Library.jpg/1280px-Xidian_University_South_Campus_Library.jpg",
            "category": "academic",
            "order": 1
        },
        {
            "name": "North Campus Historic Gate (北校区主校门与观光塔)",
            "description": "Historic campus grounds in central Xi'an with legacy telecommunication laboratories and microelectronics clean rooms.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Xidian_North_Campus.jpg/1280px-Xidian_North_Campus.jpg",
            "category": "gate",
            "order": 2
        }
    ],
    101: [ # Northwest University
        {
            "name": "Chang'an Campus Grand Museum & Lake (长安校区博物馆与西大湖)",
            "description": "Housing rare ancient Silk Road terracotta and prehistoric fossils, framed by panoramic views of the Qinling Mountains.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Northwest_University_Museum_Xian.jpg/1280px-Northwest_University_Museum_Xian.jpg",
            "category": "culture",
            "order": 1
        },
        {
            "name": "Taibai Campus Historic Red Gateway (太白校区老校门)",
            "description": "Heritage campus in Xi'an founded in 1902, featuring classical courtyard gardens and Chinese literature institutes.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Northwest_University_Taibai_Campus_Gate.jpg/1280px-Northwest_University_Taibai_Campus_Gate.jpg",
            "category": "gate",
            "order": 2
        }
    ],
    102: [ # SEU
        {
            "name": "Sipailou Campus Historic Auditorium & Fountain (四牌楼大礼堂与喷泉)",
            "description": "Constructed in 1930 with copper dome and Roman ionic columns, featured in famous films and recognized as a national architectural treasure.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Auditorium_of_Southeast_University.jpg/1280px-Auditorium_of_Southeast_University.jpg",
            "category": "culture",
            "order": 1
        },
        {
            "name": "Jiulonghu Campus Big Dipper Library (九龙湖李文正图书馆)",
            "description": "Award-winning geometric lakefront library resembling an open book and stone seal, situated on the vast new suburban campus.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Southeast_University_Jiulonghu_Library.jpg/1280px-Southeast_University_Jiulonghu_Library.jpg",
            "category": "academic",
            "order": 2
        },
        {
            "name": "Liuchao Ancient Pine Tree (六朝松)",
            "description": "A 1,500-year-old juniper tree standing on campus grounds, symbolizing the enduring spirit of higher education in Nanjing.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Six_Dynasties_Pine_SEU.jpg/1280px-Six_Dynasties_Pine_SEU.jpg",
            "category": "nature",
            "order": 3
        }
    ],
    103: [ # NUAA
        {
            "name": "Jiangning Campus Aerospace Plaza (江宁校区航天广场)",
            "description": "Dynamic open-air flight plaza displaying real fighter jets, transport planes, and rocket replicas designed by NUAA engineers.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/NUAA_Aerospace_Plaza.jpg/1280px-NUAA_Aerospace_Plaza.jpg",
            "category": "culture",
            "order": 1
        },
        {
            "name": "Ming Palace Campus Main Gate (明故宫校区御道街正门)",
            "description": "Historic campus situated on the grounds of the 14th-century Ming Dynasty Imperial Palace in central Nanjing.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/NUAA_Ming_Palace_Campus_Gate.jpg/1280px-NUAA_Ming_Palace_Campus_Gate.jpg",
            "category": "gate",
            "order": 2
        }
    ],
    104: [ # HDU
        {
            "name": "Xiasha Campus Wentian Library (下沙校区问天图书馆)",
            "description": "Futuristic water-drop shaped digital library located near the Qiantang River, serving high-tech microelectronics and cyber experts.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/HDU_Xiasha_Library.jpg/1280px-HDU_Xiasha_Library.jpg",
            "category": "academic",
            "order": 1
        },
        {
            "name": "HDU North Gate & Innovation Plaza (杭电正门与创客广场)",
            "description": "Vibrant tech-incubator entrance to Hangzhou's leading electronic science university.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Hangzhou_Dianzi_University_Gate.jpg/1280px-Hangzhou_Dianzi_University_Gate.jpg",
            "category": "gate",
            "order": 2
        }
    ],
    105: [ # ZJUT
        {
            "name": "Zhaohui Campus Historic Main Gate (朝晖校区正门与邵科馆)",
            "description": "Historic engineering campus in central Hangzhou with modern industrial engineering complexes.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/ZJUT_Zhaohui_Campus.jpg/1280px-ZJUT_Zhaohui_Campus.jpg",
            "category": "gate",
            "order": 1
        },
        {
            "name": "Pingfeng Campus Zhifei Lake (屏峰校区支斐湖与语际图书馆)",
            "description": "Scenic ecological mountain campus featuring sprawling lakes, modern glass libraries, and green chemistry institutes.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/ZJUT_Pingfeng_Lake.jpg/1280px-ZJUT_Pingfeng_Lake.jpg",
            "category": "nature",
            "order": 2
        }
    ],
    57: [ # China Academy of Art
        {
            "name": "Xiangshan Campus Kengo Kuma Folk Art Museum (象山校区民艺博物馆)",
            "description": "Masterpiece of contemporary architecture by Kengo Kuma, stepped into the tea hillside with reclaimed roof tiles.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/China_Academy_of_Art_Xiangshan_Campus.jpg/1280px-China_Academy_of_Art_Xiangshan_Campus.jpg",
            "category": "culture",
            "order": 1
        },
        {
            "name": "Nanshan Campus Lakeside Gallery (南山校区西湖艺廊)",
            "description": "Directly situated along the banks of West Lake in Hangzhou, celebrating Chinese traditional ink painting and avant-garde arts.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/China_Academy_of_Art_Nanshan_Campus.jpg/1280px-China_Academy_of_Art_Nanshan_Campus.jpg",
            "category": "academic",
            "order": 2
        }
    ],
    82: [ # Chang'an University
        {
            "name": "Weishui Campus Rainbow Bridge & South Gate (渭水校区彩虹桥与南校门)",
            "description": "Iconic civil engineering monument symbolizing global bridge construction and modern highway networks.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Changan_University_Weishui_Gate.jpg/1280px-Changan_University_Weishui_Gate.jpg",
            "category": "gate",
            "order": 1
        },
        {
            "name": "Yanta Campus Yifu Library (雁塔校区逸夫图书馆)",
            "description": "Located adjacent to the Giant Wild Goose Pagoda in Xi'an, housing historical road engineering archives.",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Changan_University_Library.jpg/1280px-Changan_University_Library.jpg",
            "category": "academic",
            "order": 2
        }
    ]
}

created_count = 0
for uni_id, items in landmarks_data.items():
    try:
        uni = University.objects.get(id=uni_id)
        for item in items:
            CampusLandmark.objects.update_or_create(
                university=uni,
                name=item["name"],
                defaults={
                    "description": item["description"],
                    "image_url": item["image_url"],
                    "category": item["category"],
                    "order": item["order"]
                }
            )
            created_count += 1
        print(f"Added {len(items)} landmarks for {uni.name}")
    except University.DoesNotExist:
        print(f"Uni id {uni_id} not found, skipping")

print(f"Total landmarks created/updated: {created_count}")
