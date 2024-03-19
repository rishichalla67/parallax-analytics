import React, { useState, useEffect } from "react";

const kujiraTokenMappings = {
    'ibc/7023F9629A70F8112764D959D04F52EA3115A0AED3CEE59694799FD8C91A97FA': { symbol: 'akt', decimals: 6 },
    'ibc/F33B313325B1C99B646B1B786F1EA621E3794D787B90C204C30FE1D4D45970AE': { symbol: 'ampluna', decimals: 6 },
    'ibc/034FBAB83B9B8AB35217DD59452C92EBC845ECD2E44AB17D260D9A2E7200AC79': { symbol: 'ampwhale', decimals: 6 },
    'ibc/D36D2BBE441D3605EEF340EAFAC57D669880597073050A2650B1468F1634A5F5': { symbol: 'aqua', decimals: 6 },
    'ibc/640E1C3E28FD45F611971DF891AE3DC90C825DF759DF8FAA8F33F7F72B35AD56': { symbol: 'astro', decimals: 6 },
    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': { symbol: 'atom', decimals: 6 },
    'ibc/C01154C2547F4CB10A985EA78E7CD4BA891C1504360703A37E1D7043F06B5E1F': { symbol: 'axl', decimals: 6 },
    'ibc/3914BDEF46F429A26917E4D8D434620EC4817DC6B6E68FB327E190902F1E9242': { symbol: 'axldai', decimals: 18 },
    'ibc/FC59D6840A41252352263CEA2B832BB86D68D03CBA194263CB9F3C15946796FB': { symbol: 'axllink', decimals: 18 },
    'ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F': { symbol: 'axlusdc', decimals: 6 },
    'ibc/F2331645B9683116188EF36FC04A809C28BD36B54555E8705A37146D0182F045': { symbol: 'axlusdt', decimals: 6 },
    'ibc/004EBF085BBED1029326D56BE8A2E67C08CECE670A94AC1947DF413EF5130EB2': { symbol: 'axlwavax', decimals: 18 },
    'ibc/DADB399E742FCEE71853E98225D13E44E90292852CD0033DF5CABAB96F80B833': { symbol: 'axlwbnb', decimals: 18 },
    'ibc/301DAF9CB0A9E247CD478533EF0E21F48FF8118C4A51F77C8BC3EB70E5566DBC': { symbol: 'axlwbtc', decimals: 8 },
    'ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7': { symbol: 'axlweth', decimals: 18 },
    'ibc/3607EB5B5E64DD1C0E12E07F077FF470D5BC4706AFCBC98FE1BA960E5AE4CE07': { symbol: 'cmdx', decimals: 6 },
    'ibc/1603E8643A49AD47F536F645A4BF0E4C1E06C76F0A98CBE8054B177F1EE7C39A': { symbol: 'cmst', decimals: 6 },
    'ibc/C082038FB8D212B1678142F381A47056CADD18617F6077C3162A9E97C2490921': { symbol: 'crbrus', decimals: 6 },
    'ibc/BBC45F1B65B6D3C11C3C56A9428D38C3A8D03944473791C52DFB7CD3F8342CBC': { symbol: 'cro', decimals: 8 },
    'ibc/B37E4D9FB5B30F3E1E20A4B2DE2A005E584C5C822C44527546556AE2470B4539': { symbol: 'dot', decimals: 10 },
    'ibc/CF90BCBEDFF409F9187A0C3A69C1082D56908DC3F7FC342ED82455A504AD8AA9': { symbol: 'dvpn', decimals: 6 },
    'ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10': { symbol: 'evmos', decimals: 18 },
    'ibc/90D9BE4D0D9BFD6AE61FCACF84765820EDA9EE795548324AD60FF416E6685ECF': { symbol: 'frnz', decimals: 6 },
    'ibc/53796B3762678CD80784A7DD426EB45B89C024BE3D45224CC83FDE3DED7DA0A1': { symbol: 'fury', decimals: 6 },
    'ibc/7B87E813A8B02F4BC5B448C96A5DE131F2F5F6BA7DEDF0D9D3F0F2CA5BB256FA': { symbol: 'gdai', decimals: 0 },
    'ibc/B4DCACF7753C05040AF0A7BF2B583402C4B8C9B0A86FCECE32EF63CB7F0A46B3': { symbol: 'gpaxg', decimals: 18 },
    'ibc/24DD547340629EACCFEFDE8461A0A40769239CBC9E2ADB2ED0C51C324EEB93A7': { symbol: 'gpstake', decimals: 0 },
    'ibc/D20559F0071F4BFDFF519D0C12B77AFE2A4481D44214BD92808B0C36B1E223C9': { symbol: 'grav', decimals: 6 },
    'ibc/35C18EBF8C2691FA9AAAAD0E8B9ECA8C3C903D681429C6017E3F6CE49B786E81': { symbol: 'gweth', decimals: 0 },
    'ibc/46B7745F093B6185D871EBE8EA3B3EDE54E7CBFDF9B8DB6EE0F8DF3446B388A5': { symbol: 'harbor', decimals: 6 },
    'ibc/5A3DCF59BC9EC5C0BB7AA0CA0279FC2BB126640CB8B8F704F7BC2DC42495041B': { symbol: 'inj', decimals: 18 },
    'ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5': { symbol: 'juno', decimals: 6 },
    'ibc/8318B7E036E50C0CF799848F23ED84778AAA8749D9C0BCD4FF3F4AF73C53387F': { symbol: 'loop', decimals: 6 },
    'ibc/DA59C009A0B3B95E0549E6BF7B075C8239285989FF457A8EDDBB56F10B2A6986': { symbol: 'luna', decimals: 6 },
    'ibc/DBF6ABDB5F3D4267C039967515594453F4A31007FD838A566F563A01D2C2FB80': { symbol: 'mars', decimals: 6 },
    'ibc/5F5BB5A442F82738439F52F89706B0F74372B9BD80F87DCB148128C8C07CA095': { symbol: 'ngm', decimals: 6 },
    'ibc/2F1447818CF99498AE62D9FB4D5E0C9FD48C68FC118C34D2ECFFFED0AD082196': { symbol: 'old-grav', decimals: 6 },
    'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23': { symbol: 'osmo', decimals: 6 },
    'ibc/0447761C090DB521DAC0268E8CB4EBF567E519B937DE6FECD2472AA6A1EDE658': { symbol: 'pepe', decimals: 18 },
    'ibc/F2A6A3D4C02E003CC3EDB84CFD1C6F8F0E21EE6815575C5FE82FAC7D96106239': { symbol: 'planq', decimals: 18 },
    'ibc/31ED168F5E93D988FCF223B1298113ACA818DB7BED8F7B73764C5C9FAC293609': { symbol: 'roar', decimals: 6 },
    'ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5': { symbol: 'scrt', decimals: 6 },
    'ibc/21038E447A2D4A1183628C0EC366FE79C2E0B0BD91F9A85E6C906CD911FD676E': { symbol: 'shd', decimals: 8 },
    'ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602': { symbol: 'stars', decimals: 6 },
    'ibc/0306D6B66EAA2EDBB7EAD23C0EC9DDFC69BB43E80B398035E90FBCFEF3FD1A87': { symbol: 'statom', decimals: 6 },
    'ibc/C19813F6D22F91CC64D2EEDF8702904DD61E0D022972EDFE0039F70C8A6EAD24': { symbol: 'stinj', decimals: 18 },
    'ibc/C905C540D8BEE0589D9442156F58D8BAA97CB549F44CFF68CB51AD0AEDD0B4EC': { symbol: 'stjuno', decimals: 6 },
    'ibc/F97BDCE220CCB52139C73066E36C45EC7EDCEEF1DAFF891A34F4FBA195A2E6E8': { symbol: 'stosmo', decimals: 6 },
    'ibc/239BFF83852F67DF5243DB89F339FF7FDBF858437F961CAB6DA5B5ADEFB2BC07': { symbol: 'strd', decimals: 6 },
    'ibc/FFA3D0E9C3CDE729559FB71A09E9E6CFA5A85AFABAC9F3CB5DD3942BFF935F9C': { symbol: 'swth', decimals: 8 },
    'ibc/BF603AD88AA4C36FC8CA99F6D703CA1D7D437A1EA97023A73A8BA4437A05ABDF': { symbol: 'cnto', decimals: 18 },
    'ibc/E67ADA2204A941CD4743E70771BA08E24885E1ADD6FD140CE1F9E0FEBB68C6B2': { symbol: 'wftm', decimals: 18 },
    'ibc/21F041CFE99994E0D027D0C5F72A9EB6224CBCAF5A6AD5DDB75F67A781D46C68': { symbol: 'whale', decimals: 6 },
    'ibc/DE92DB84EA7E8CB5EC76BC395CF634D6483B67414AD28BEF3F71EBFD6A780D36': { symbol: 'whlocal', decimals: 6 },
    'ibc/A64467480BBE4CCFC3CF7E25AD1446AA9BDBD4F5BCB9EF6038B83D6964C784E6': { symbol: 'wmatic', decimals: 18 },
    'ibc/A2146858B5E3CFE759E32F47CA54591F8E27FAEDFF731D30B448E5AB25CA8EC5': { symbol: 'wtao', decimals: 18 },
    'ibc/1AE6C91DF755F63FB9E8393F7AE6A1725B2389730C0A46ECE247D761A72DA80D': { symbol: 'xastro', decimals: 6 },
    'factory/kujira1n3fr5f56r2ce0s37wdvwrk98yhhq3unnxgcqus8nzsfxvllk0yxquurqty/ampKUJI': { symbol: 'ampkuji', decimals: 6 },
    'factory/kujira1jwdc6rhj2jqc9kn4jc76denz8jtj00y3nqnutg/ubfit': { symbol: 'bfit', decimals: 6 },
    'factory/kujira14wv3whn3v9sgf8r0dm7a46v7m7pukhs87x73e0ude3ktuzztfj9qxndumz/ulp': { symbol: 'bow: atom-axlusdc', decimals: 6 },
    'factory/kujira1yncutssgh2vj9scaymtteg949hwcft07c6qmgarxnaf04yesq3jsn6g2uv/ulp': { symbol: 'bow: atom-usk', decimals: 6 },
    'factory/kujira12506pfme6layua70svszn2xza0pt9mnqu2u24lszrdyywmpvnw5qfz8sfq/ulp': { symbol: 'bow: axlusdc-usk', decimals: 6 },
    'factory/kujira1337sclk2nc6srd77w4v8qule0nv9r70mrt56r2j8zak3rlg6xc0sl27tar/ulp': { symbol: 'bow: dot-axlusdc', decimals: 6 },
    'factory/kujira1uchf9h2suq6a9a0ksyp5rh9536uqxydswm37sswa888kxxx2kqgqsx3n6h/ulp': { symbol: 'bow: dot-usk', decimals: 6 },
    'factory/kujira1hgq0fgqnv0dk2r474pfax3va86wfh9ffgdhx6q6jls00g7nv8vmsx2jnjt/ulp': { symbol: 'bow: fury-usk', decimals: 6 },
    'factory/kujira13y8hs83sk0la7na2w5g5nzrnjjpnkvmd7e87yd35g8dcph7dn0ksenay2a/ulp': { symbol: 'bow: kuji-atom', decimals: 6 },
    'factory/kujira1sx99fxy4lqx0nv3ys86tkdrch82qygxyec5c8dxsk9raz4at5zpq72gypx/ulp': { symbol: 'bow: kuji-axlusdc', decimals: 6 },
    'factory/kujira1hfj06505jjk2ut5a0j6f5wx04pj2s05qk8nydng7kznkuzpe8w2se24jqx/ulp': { symbol: 'bow: kuji-luna', decimals: 0 },
    'factory/kujira1g9xcvvh48jlckgzw8ajl6dkvhsuqgsx2g8u3v0a6fx69h7f8hffqaqu36t/ulp': { symbol: 'bow: kuji-usk', decimals: 6 },
    'factory/kujira1n648rfqqvjxm6c7zgfnfqay85rkapgg0z7da9pnmjazz5m5d7l0qxdtq90/ulp': { symbol: 'bow: lp stars-usk', decimals: 6 },
    'factory/kujira1y0v5znl0ucc6nsdalr9xeg0r3zyw44yn0uyd8tsgc8gl4j8stjcs9vmmr7/ulp': { symbol: 'bow: luna-usk', decimals: 0 },
    'factory/kujira10sx8wxzev270zrmpq6z3asgpurdjfh9f6rwtgt55mar9m6gtw40s9nfxcy/ulp': { symbol: 'bow: scrt-usk', decimals: 0 },
    'factory/kujira1ngqlypl5h0mkgxmk4why878eq4y5yh6yhdtrw8hdxfz202xluzrs097qn5/ulp': { symbol: 'bow: weth-axlusdc', decimals: 6 },
    'factory/kujira1xwvvjq5w0887v2vz4e83kcu38s0jq8q8lqa3z5hxm295q7y4uejqp24la7/ulp': { symbol: 'bow: weth-usk', decimals: 6 },
    'factory/kujira1sstqldl7tyvvdseppsa022acrxp7cuuplkc7639w7x7cmm4hjvvqah0hgy/bampLUNAUSK': { symbol: 'bw vault: ampluna/usk', decimals: 6 },
    'factory/kujira1wfa20sv00kpgnj38j3akds2m64pvk7yrhylgyj7587lyl8mtc8xsam89dg/bATOMaxlUSDC': { symbol: 'bw vault: atom/axlusdc', decimals: 6 },
    'factory/kujira1d5v9z4xzfswjh80r0ynuup68qzkr45lktje83gdxlnmnfnh4wvys3zr8pj/bATOMUSK': { symbol: 'bw vault: atom/usk', decimals: 6 },
    'factory/kujira1g4lg4uqjqmqs026k6hr5le9fkhd3cpthdklxaa4r2nral5ct3uzqphm9ac/baxlUSDCUSK': { symbol: 'bw vault: axlusdc/usk', decimals: 6 },
    'factory/kujira1kd2a2zct0yj4l7yz8r0hz55cmplz0n7jvjq8gj3sf42u0s6uurnsjf5meu/bKUJIATOM': { symbol: 'bw vault: kuji/atom', decimals: 6 },
    'factory/kujira168pnd5cyadhppfxvug4gchd52vuau5vkletxtfld7hdavwtgcu9sjem6z5/bKUJIaxlUSDC': { symbol: 'bw vault: kuji/axlusdc', decimals: 6 },
    'factory/kujira1yqh4gfa75jh2q82e9ada98l9qz7xf0xvwa399cl52a4vrv3kxzvstrjuy0/bKUJIUSK': { symbol: 'bw vault: kuji/usk', decimals: 6 },
    'factory/kujira15k76p44rfhep7qjvgq9unek8037km0e45mrexknf340hsua6penqtl33cn/bOSMOaxlUSDC': { symbol: 'bw vault: osmo/axlusdc', decimals: 6 },
    'factory/kujira1leewphkx87lq2yuz8pmxw4yqlenfm25ruahj75p6vhf2cfk7p82qwcr8mn/bSTARSaxlUSDC': { symbol: 'bw vault: stars/axlusdc', decimals: 6 },
    'ukuji': { symbol: 'kuji', decimals: 6 },
    'factory/kujira1swkuyt08z74n5jl7zr6hx0ru5sa2yev5v896p6/local': { symbol: 'local', decimals: 6 },
    'factory/kujira1kupjzlp96l4ypt0fdpse8slmkdkkz3g0t5evy033va0gvtw867sq0cm6q0/ulp': { symbol: 'lp aqua-usk', decimals: 0 },
    'factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta': { symbol: 'mnta', decimals: 6 },
    'factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk': { symbol: 'usk', decimals: 6 },
    'factory/kujira12cjjeytrqcj25uv349thltcygnp9k0kukpct0e/uwink': { symbol: 'wink', decimals: 6 },
    'factory/kujira1e6kvcdpxtu30t8x9sx0k692tln9z636gyu8sqf6w5fm5z3jrvjjqc8qfkr/urcpt': { symbol: 'xatom', decimals: 6 },
    'factory/kujira1e224c8ry0nuun5expxm00hmssl8qnsjkd02ft94p3m2a33xked2qypgys3/urcpt': { symbol: 'xaxlusdc', decimals: 6 },
    'factory/kujira143fwcudwy0exd6zd3xyvqt2kae68ud6n8jqchufu7wdg5sryd4lqtlvvep/urcpt': { symbol: 'xkuji', decimals: 6 },
    'factory/kujira1w4yaama77v53fp0f9343t9w2f932z526vj970n2jv5055a7gt92sxgwypf/urcpt': { symbol: 'xusk', decimals: 6 },
    'factory/kujira1zqt93wk5gkayyvclq7h9fyvtgvstu3kg23ez5hxgqyrtq2sut6jsk9tzx9/urcpt': { symbol: 'xwbnb', decimals: 6 },
    'ibc/107ED1024220D5EE2A3E81BACD4A0B6709687F09043A53348E6D7E7647375593': { symbol: 'rio', decimals: 18 },
    'ibc/950993C6DA64F5A60A48D65A18CAB2D8190DE2DC1B861E70E8B03C61F7D5FBDC': { symbol: 'arch', decimals: 18},
    'ibc/6A4CEDCEA40B587A4BCF7FDFB1D5A13D13F8A807A22A4E759EA702640CE086B0': { symbol: 'dydx', decimals: 18 },
    'ibc/9012F7E79EACC34CE81A4404ECBEED5A5DFFD61CCEE23F2B8600BAC948C483E6': { symbol: 'dym', decimals: 18 },
    'ibc/96179F5B44CCC15E03AB43D7118E714B4D5CE8F187F7D8A60F2A514299761EA9': { symbol: 'arb', decimals: 18},
    'ibc/B572E6F30E7C33D78A50D8B4E973A9C118C30F848DF31A95FAA5E4C7450A8BD0': { symbol: 'wsteth', decimals: 18 },
    'ibc/0A88A08F3E9573DB9D8CB74AA3746F6D23C41C3EE7B6CC5AA4695A1DD74FF86B': { symbol: 'uni', decimals: 18},
    'ibc/0B41F8EB39912A15611BC834EB98962B59EE03C4CA8F781E709BB875BC18DC4B': { symbol: 'neok', decimals: 18},
    'ibc/B4B3B08FE5FEA65CB25E467C9D95D180A6CDB0EBE730E7BB20CA1BF6C9A80D9B': { symbol: 'yieldeth', decimals: 18 },
    'factory/kujira13ryry75s34y4sl5st7g5mhk0he8rc2nn7ah6sl/SPERM': { symbol: 'sperm', decimals: 6},
    'factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk': { symbol: 'nstk', decimals:  6},
    'factory/kujira1jelmu9tdmr6hqg0d6qw4g6c9mwrexrzuryh50fwcavcpthp5m0uq20853h/urcpt': { symbol: 'xusdc', decimals: 6},
    'ibc/4925CCFAD4FFBC63D7C52BB9AE2DE8CF7D0809124FBA1F44F4F2B7B4267D5E5A': { symbol: 'cub', decimals: 6},
    'factory/kujira1sc6a0347cc5q3k890jj0pf3ylx2s38rh4sza4t/ufuzn': { symbol: 'fuzn', decimals: 6 },
    'factory/kujira1m96ucsfpt2yy72w09z2rxjdj38y5qd8lqx5jtggnejmdua2ynpnsxyvjex/urcpt': { symbol: 'qckuji', decimals: 6 },
    'factory/kujira1md94f5metrd4fhecalrmhtac5t4upeg9gz2e24hmuszdtgfxy85qvkphnw/urcpt': { symbol: 'xgpaxg', decimals: 18 },
    'factory/kujira166ysf07ze5suazfzj0r05tv8amk2yn8zvsfuu7/uplnk': { symbol: 'plnk', decimals: 6},
    'ibc/782817D588181841C9EB508E14B9A8A984E21590B83FEAC86BB44B0BA58C37F5': { symbol: 'cheq', decimals: 9},
    'factory/kujira16rujrka8vk3c7l7raa37km8eqcxv9z583p3c6e288q879rwp23ksy6efce/bMNTA05': { symbol: 'bMNTA05', decimals: 6 },
    'factory/kujira1qzu3up50auxhqyzfq56znuj8n38q2ra7daaf9ef7vg8gu66jh4fqd2wd2y/urcpt': { symbol: 'qcmnta', decimals: 6 },
    'ibc/A6826D67800ED864F3BF51D56B0165DAF2491B00D93433564158D87BAA0C82BE': { symbol: 'nbtc', decimals: 14 },
    'factory/kujira1l04ged98c7a7s9tllu62ld09ztylwf442qgm4thfgmadrvngeumsz4zrh2/urcpt': { symbol: 'qcfuzn', decimals: 6 },
    'ibc/119334C55720942481F458C9C462F5C0CD1F1E7EEAC4679D674AA67221916AEA': { symbol: 'lunc', decimals: 6 },
    'ibc/359AF48D8512344FD8B6514CA79C26AC120B4F12FFE2D2A46528A58439272BD5': { symbol: 'fury', decimals: 6 },
    'ibc/963532A97C3EF15733C579611D0A93D6B6789051330727EC3DEB173643236BEA': { symbol: 'ophir', decimals: 6 },
    'ibc/590CE97A3681BC2058FED1F69B613040209DF3F17B7BD31DFFB8671C4D2CD99B': { symbol: 'shd', decimals: 8 },
    'ibc/675CC877238E9063F5C63D8AC9435AE2833B499200F541C6F0F2D4F07CD65261': { symbol: 'guppy', decimals: 6 },
    'ibc/AB5A3681C25F2FEE9F167C0345D6E7C52DBDFE6D6ADD38A76BF6A0028F42426D': { symbol: 'andr', decimals: 6 },
    'ibc/A7A5C44AA67317F1B3FFB27BAFC89C9CC04F61306F6F834F89A74B8F82D252A1': { symbol: 'somm', decimals: 6 },
    'ibc/3CF31CB1729FD2011718F66B20861D23A7FB6492C29FFADE2C1E58D10C3D225F': { symbol: 'newt', decimals: 6 },
    'ibc/4EFD563C64F84F60AFB4BB7A8473AAA632CF5817FDF2CF51E68E4E3EDAE66430': { symbol: 'odin', decimals: 6 },
    'ibc/91DAE8E9D19A6A770D2A787E54E1D388F8E603D89093FC4939CE36125CB8284D': { symbol: 'tori', decimals: 6 },
    'ibc/B64A07C006C0F5E260A8AD50BD53568F1FD4A0D75B7A9F8765C81BEAFDA62053': { symbol: 'lvn', decimals: 6 },
    'ibc/68C6671BC8A27E137FD2E254F1C09A6147567D30B3490BB261F861EEC8843080': { symbol: 'apollo', decimals: 6 },
    'ibc/BFDEE4E7F0E8371F195C2A6CFB70E54C18361E475FC26BE3A38B36E55FCEFDD6': { symbol: 'sayve', decimals: 6 },
    'ibc/AF371F507606449381F82454241BF562E742312BE5744B08AF66D8840C12A5C6': { symbol: 'bmos', decimals: 6 },
    'ibc/173E561B8E97AB49FBA540663C1D02DC1B2D2871B5C8434935982CB15B0C7765': { symbol: 'ntrn', decimals: 6 },
    'factory/kujira175yatpvkpgw07w0chhzuks3zrrae9z9g2y6r7u5pzqesyau4x9eqqyv0rr/ampMNTA': { symbol: 'ampmnta', decimals: 6 },
    'factory/kujira1sr3tceueht9tp6tzvxpjvwkfr8uk87edwwe24jt7ug7xn85za5tqq30tf7/urcpt': { symbol: 'xstars', decimals: 6 },
    'factory/kujira19mmvst3l3y6c3mtyqhj7vxne4g69ayd9lq323w7k270p6fp0sy6qlv642l/urcpt': { symbol: 'xluna', decimals: 6 },
    'factory/kujira16rujrka8vk3c7l7raa37km8eqcxv9z583p3c6e288q879rwp23ksy6efce/bFUZN01': { symbol: 'bFUZN01', decimals: 6 },
    'ibc/B618D0F4CBB4AF5E21B4FF163CCBFBC278C037D1DA3E1D848EDF32716A216BE4': { symbol: 'glto', decimals: 6 },
    'factory/kujira17clmjjh9jqvnzpt0s90qx4zag8p5m2p6fq3mj9727msdf5gyx87qanzf3m/ulp': { symbol: 'bow: fuzn-usk', decimals: 6 },
    'factory/kujira1q8p9n7cefe8eet4c62l5q7dx2c9y6c6hnlkaghkqhukt2kaf58zs3yrap4/urcpt': { symbol: 'xjuno', decimals: 6},
    'factory/kujira1h35rpadutnwjrsy8nn83fhfsu54xs3tpgsn04fd8l08lxdl22jeqt6jmhg/urcpt': { symbol: 'xdot', decimals: 10 },
    'factory/kujira1gqlvqhp8hqlvljcy2fpz39jslse39phye3drhe6ntdsmlyygkjwq9v6xmz/urcpt': { symbol: 'xosmo', decimals: 6 },
    'factory/kujira1sc6a0347cc5q3k890jj0pf3ylx2s38rh4sza4t/uyfuzn': { symbol: 'yfuzn', decimals: 6 },
    'ibc/2661BA7AD557526A9BE35C7576EEF8E82B14A01ECCE36AD139979FD683D37C9D': { symbol: 'rac', decimals: 6 },
    'factory/kujira14vdfdpsrr8u4m3zvrfa0d6ekzc52xp0lemz2wjh8g0hu225nvm2qhcpd9m/urcpt': { symbol: 'xakt', decimals: 6 },
    'factory/kujira16rujrka8vk3c7l7raa37km8eqcxv9z583p3c6e288q879rwp23ksy6efce/bMNTA04': { symbol: 'bMNTA04', decimals: 6 },
    'ibc/193C32A9BB54632C383CF2D2BA1A47F73624446D8554762F934B7A61EF26B191': { symbol: 'mntl', decimals: 6 },
    'factory/kujira1t6anuwgxf22av6kna33tyyfapetca243zydvkahmv252f03gvapqsjv2ln/urcpt': { symbol: 'xwhsol', decimals: 8 },
    'ibc/2618165FB15523140C34365941366CBD2124D161A07B70E7B86071BD12A0E4AE': { symbol: 'bad', decimals: 6 },
    'factory/kujira1xhxefc8v3tt0n75wpzfqcrukzyfneyttdppqst84zzdxnf223m2qm4g5at/urcpt': { symbol: 'xwbtc', decimals: 8 }

};

const kujiraGhostContracts = {
    'kujira143fwcudwy0exd6zd3xyvqt2kae68ud6n8jqchufu7wdg5sryd4lqtlvvep': {contract: "xkuji"},
    'kujira1jelmu9tdmr6hqg0d6qw4g6c9mwrexrzuryh50fwcavcpthp5m0uq20853h': {contract: 'xusdc'},
    'kujira1w4yaama77v53fp0f9343t9w2f932z526vj970n2jv5055a7gt92sxgwypf': {contract: 'xusk'},
    'kujira1xhxefc8v3tt0n75wpzfqcrukzyfneyttdppqst84zzdxnf223m2qm4g5at': {contract: 'xwbtc'}
}

export default function Kujira() {
  const [kujiAddress, setKujiAddress] = useState("kujira17ephyl7pxx7hrauhu6guf62z7nrtszj2dj90nr")
  const [kujiraData, setKujiraData] = useState(null);
  const [kujiraBalances, setKujiraBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let forceRefresh = false;

  const env = "prod";
  const serverURL = env === "dev" ? "http://localhost:225" : "https://parallax-analytics.onrender.com";

  const [ghostPrices, setGhostPrices] = useState({});
  const [prices, setPrices] = useState({});


  
  
  const fetchKujiraBalances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://lcd-kujira.mintthemoon.xyz/cosmos/bank/v1beta1/balances/${kujiAddress}`);
      const { balances } = await response.json();
      setKujiraBalances(balances);
    } catch (error) {
      console.error("Error fetching Kujira balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGhostPrices = async () => {
    let pricesObj = {};
    for (const key in kujiraGhostContracts) {
      const contract = kujiraGhostContracts[key].contract;
      const response = await fetch(`${serverURL}/fetchGhostPrices?contract=${key}`);
      const data = await response.json();
      if (data.price) {
        pricesObj[contract] = data.price;
      }
    }
    setGhostPrices(pricesObj);
  };

  const fetchPrices = async () => {
    let prices = {};
    const response = await fetch(`${serverURL}/ophir/prices`);
    prices = await response.json();
    console.log(prices);
    setPrices(prices);
  };
//   useEffect(() => {
//     fetchKujiraBalances();
//   }, [kujiAddress]);

  useEffect(() => {
    fetchGhostPrices();
    fetchPrices();
  }, []);

  const fetchKujiraData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${serverURL}/kujiraGhostBalance?address=${kujiAddress}&forceRefresh=${forceRefresh}`);
      const data = await response.json();
      setKujiraData(data);
      fetchKujiraBalances();
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Kujira data:", error);
      setIsLoading(false);
    }
  };


  // Add your component logic here
  return (
    <>
        <p className="pt-2">Please enter your Kujira address</p>
        <div className="flex justify-center items-center p-4">
            <input
                type="text"
                value={kujiAddress}
                onChange={(e) => setKujiAddress(e.target.value)}
                placeholder="Enter your Kujira address"
                className="w-full p-2 border-2 border-sky-500 rounded-md focus:outline-none focus:border-sky-600 bg-slate-800 placeholder-bold"
                style={{ maxWidth: '600px' }}
            />
            <button
                onClick={fetchKujiraData}
                className="ml-2 p-2 border-2 border-sky-500 rounded-md focus:outline-none focus:border-sky-600 bg-slate-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </div>
        <hr className="my-4 border-gray-200" />
        {isLoading ? (
            <div className="flex justify-center items-center h-15%">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        ) : (
            <>
                
                {kujiraData && kujiraBalances && ghostPrices && prices && (
                    <div className="flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold mb-4">Ghost</h3>
                        <div className="overflow-x-auto pb-2">
                            <table className="table-auto text-left whitespace-no-wrap">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white text-xs sm:text-sm">
                                        <th className="px-4 py-2">Asset</th>
                                        <th className="px-4 py-2">Initial Deposit</th>
                                        <th className="px-4 py-2">Current Deposit</th>
                                        <th className="px-4 py-2">Interest Earned</th>
                                        <th className="px-4 py-2">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-black">
                                    {Object.entries(kujiraData).map(([key, value]) => {
                                        const displayKey = key.includes('/u') ? key.substring(key.lastIndexOf('/u') + 2) : key;
                                        const displayXKey = `x${displayKey.toLowerCase()}`;
                                        const mapping = Object.entries(kujiraTokenMappings).find(([key, value]) => value.symbol.toLowerCase() === displayXKey);
                                        const originalDenom = mapping ? mapping[0] : undefined;
                                        const decimals = mapping ? mapping[1].decimals : undefined;
                                        // console.log(originalDenom, decimals)

                                        // Find the corresponding balance from kujiraBalances
                                        const balance = kujiraBalances.find(({ denom }) => denom === originalDenom);
                                        const currentDepositValue = balance && ghostPrices[displayXKey] ? (balance.amount / Math.pow(10, decimals) * ghostPrices[displayXKey]).toFixed(2) : "-";
                                        // console.log("Current Deposit Value for " + displayXKey + ": ", currentDepositValue);
                                        return (
                                            <tr className="hover:bg-slate-600 text-xs sm:text-sm" key={key}>
                                                <td className="border px-4 py-2">{displayKey}</td>
                                                <td className="border px-4 py-2">{Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                <td className="border px-4 py-2">{Number(currentDepositValue).toLocaleString()}</td>
                                                <td className="border px-4 py-2">{(Number(currentDepositValue) - Number(value)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                <td className="border px-4 py-2">${((Number(currentDepositValue) - Number(value))*prices[key.toLowerCase()]).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {kujiraBalances.length > 0 && (
                    <div className="flex flex-col items-center justify-center mb-8">
                        <h3 className="text-lg font-semibold mb-4">Kujira Balances</h3>
                        <div className="overflow-x-auto pb-2">
                            <table className="table-auto text-left whitespace-no-wrap">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white text-xs sm:text-sm">
                                        <th className="px-4 py-2">Symbol</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-black">
                                    {kujiraBalances
                                      .map(({ denom, amount }) => {
                                        const tokenInfo = kujiraTokenMappings[denom];
                                        const symbol = tokenInfo ? tokenInfo.symbol : denom;
                                        const decimals = tokenInfo ? tokenInfo.decimals : 0;
                                        const formattedAmount = amount / Math.pow(10, decimals);
                                        // Check in ghostPrices first, if not found then check in prices
                                        const price = ghostPrices[symbol] || prices[symbol.toLowerCase()] || 0;
                                        const value = price ? (formattedAmount * price).toFixed(2) : "-";
                                        return { symbol, formattedAmount, value: value !== "-" ? parseFloat(value) : 0 }; // Convert value to number or 0 if "-"
                                      })
                                      .filter(({ value, formattedAmount }) => value >= 0.005 || formattedAmount > 0.01)
                                      .sort((a, b) => b.value - a.value) // Sort by value, treating "-" as 0
                                      .map(({ symbol, formattedAmount, value }) => (
                                        <tr className="hover:bg-slate-600 text-xs sm:text-sm">
                                            <td className="border px-4 py-2">{symbol}</td>
                                            <td className="border px-4 py-2">{formattedAmount}</td>
                                            <td className="border px-4 py-2">{value !== 0 ? `$${Number(value).toLocaleString()}` : "-"}</td> 
                                        </tr>
                                      ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        )}
    </>
  );
}