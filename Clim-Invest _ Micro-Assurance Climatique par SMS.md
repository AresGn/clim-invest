# Clim-Invest : Micro-Assurance Climatique par SMS pour l'Afrique de l'Ouest

## Le Défi Urgent

L'agriculture africaine traverse une crise climatique sans précédent. Avec seulement **1% des petits agriculteurs** assurés en Afrique contre **50% en Asie** et **15% en Amérique latine**[^1], le continent fait face à un déficit critique de protection contre les chocs climatiques.

![Agricultural Insurance Penetration Rates by Global Region](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/61c2b6a736514a7ffa92e88935c10469/be9cc11a-578c-43e7-a35a-f3014f20096b/216497fe.png)

Agricultural Insurance Penetration Rates by Global Region

Les données révèlent que **97% des agriculteurs africains** restent non assurés[^2], exposés aux risques croissants de sécheresses, inondations et tempêtes qui dévastent régulièrement leurs récoltes.

Cette vulnérabilité est d'autant plus préoccupante que l'Afrique représente 17% des terres arables mondiales mais seulement 0,7% des primes d'assurance agricole globales[^3]. Les obstacles traditionnels - coûts prohibitifs, complexité administrative, faible bancarisation - empêchent l'accès à la protection financière pourtant essentielle à la sécurité alimentaire du continent[^1][^4].

## La Solution Mobile-First : Clim-Invest

Face à cette urgence, **Clim-Invest** propose une révolution technologique adaptée au contexte africain : une micro-assurance climatique entièrement opérée par SMS et mobile money. Cette approche low-tech, low-cost tire parti de la croissance fulgurante du mobile money en Afrique de l'Ouest, qui représente désormais 33% des comptes mondiaux[^5] avec plus de 485 millions de comptes actifs[^6].

### Architecture Technique Innovante

**Souscription Express (3 minutes)**
Le processus de souscription utilise les infrastructures mobiles existantes avec un système USSD universel (*888\#). Les agriculteurs choisissent leur culture (maïs, coton, arachide, sésame) et paient des primes micro-adaptées (200-1 000 FCFA/mois) via MTN MoMo, Orange Money ou Flooz[^7]. Une interface vocale en langues locales (fon, yoruba, bambara) garantit l'inclusion des populations non-alphabétisées, sachant que les taux d'alphabétisation varient considérablement en zone rurale[^8][^9].

**Indemnisation Automatique par Satellite**
Le système exploite les données satellites de dernière génération :

- **Indices NDVI** (NASA/MODIS) pour détecter le stress hydrique des cultures[^10][^11]
- **Imagerie Sentinel-1** pour cartographier les inondations en temps réel[^12][^13]
- **Données météorologiques AGRHYMET** pour les alertes tempêtes[^14][^15]

Lorsque les seuils critiques sont atteints, les paiements (jusqu'à 50 000 FCFA) sont déclenchés automatiquement sous 24-72h via mobile money, éliminant toute paperasse administrative[^16][^17].

### Tarification Dynamique Basée sur le Risque

| **Culture** | **Zone Exemple** | **Prime Mensuelle** | **Couverture Max** |
| :-- | :-- | :-- | :-- |
| **Maïs** | Donga (Bénin, haut risque) | 800 FCFA | 30 000 FCFA |
| **Coton** | Borgou (Bénin, moyen risque) | 600 FCFA | 25 000 FCFA |
| **Arachide** | Kaolack (Sénégal, moyen risque) | 500 FCFA | 20 000 FCFA |
| **Maraîchage** | Atlantique (Bénin, faible risque) | 400 FCFA | 15 000 FCFA |

## Déploiement Régional Structuré

### Phase 1 : Pilote Multi-Pays (12 mois)

- **Zones d'intervention** : Nord Bénin (sécheresse), Delta du Niger (inondations), Centre Sénégal (variabilité pluviométrique)
- **Partenaires clés** : MTN Group, Orange, AGRHYMET, FENAFER-Bénin, FONGS-Sénégal
- **Objectif** : 25 000 agriculteurs assurés


### Phase 2 : Expansion Régionale (24 mois)

- **Couverture** : 15 pays CEDEAO + UEMOA
- **Intégration** : Plateforme AgriPME (application agricole nationale)
- **Subventions** : 50% des primes pour micro-exploitants (<2 hectares)
- **Objectif** : 500 000 agriculteurs assurés d'ici 2027


## Avantages Compétitifs vs Assurance Traditionnelle

| **Critère** | **Clim-Invest** | **Assurance Classique** |
| :-- | :-- | :-- |
| **Coût mensuel** | 200-1 000 FCFA | 5 000-20 000 FCFA[^18] |
| **Délai d'indemnisation** | 24-72h automatique | 3-6 mois (expertise)[^3] |
| **Accessibilité** | Mobile money + analphabètes | Bureau + compte bancaire |
| **Couverture géographique** | Zones reculées via satellite | Centres urbains uniquement |
| **Prérequis** | Téléphone basique | Smartphone + internet |

## Fondations Technologiques Éprouvées

Les données satellites sont accessibles gratuitement via Digital Earth Africa[^19][^20], qui fournit des images historiques depuis 1984 couvrant tout le continent africain. Le système NDVI permet de détecter le stress des cultures jusqu'à 2 semaines avant détection visuelle[^21], tandis que Sentinel-1 offre une précision >95% pour la détection d'inondations[^13].

Les infrastructures AGRHYMET[^14][^22] garantissent l'accès aux données météorologiques en temps réel pour les 15 pays de la CEDEAO, avec des stations météo automatisées et des modèles de prévision saisonnière Next Generation[^23].

## Modèle Économique Durable

- **80%** des primes → Fonds d'indemnisation
- **15%** → Coûts techniques (données, SMS, plateforme)
- **5%** → Croissance et réserves

**Seuil de rentabilité** : 50 000 assurés avec un fonds de réserve gouvernemental de 10% des primes pour les catastrophes majeures.

## Enseignements Internationaux

**Kenya (Kilimo Salama)** : Lancé en 2009 avec 200 agriculteurs, le programme a atteint 51 000 assurés au Kenya et 14 000 au Rwanda[^24][^25]. Les revenus de primes sont passés de 19 millions KSh en 2011 à 33 millions KSh en 6 mois en 2012[^26].

**Inde (PMFBY)** : Le programme gouvernemental couvre 194 millions d'agriculteurs avec des subventions de 50% des primes[^18][^27]. Les primes varient de 1,5% à 5% des sommes assurées selon les cultures[^28].

Ces succès démontrent la viabilité de l'assurance indicielle à grande échelle avec un soutien public approprié.

## Financement et Perspectives

Le financement pourrait être structuré via un partenariat **Banque Mondiale-FIDA** avec des contributions nationales. Les subventions de primes, pratique standard mondial (73% aux États-Unis, 50% en Inde)[^18], sont essentielles pour l'adoption initiale.

**Extensions futures** :

- Crédits bancaires basés sur l'historique d'assurance
- Alertes préventives 48h avant événements climatiques
- Réductions tarifaires progressives (15% après 3 ans sans sinistre)
- Intégration avec coopératives agricoles pour distribution


## Impact Transformationnel

Clim-Invest représente plus qu'une innovation technologique : c'est un instrument de justice climatique pour l'Afrique de l'Ouest. En démocratisant l'accès à l'assurance agricole via les technologies mobiles, le programme peut protéger des millions d'agriculteurs contre l'insécurité alimentaire et briser le cycle de pauvreté rural.

L'objectif de **500 000 agriculteurs protégés d'ici 2027** équivaut à sécuriser les revenus de 2,5 millions de personnes (en comptant les ménages), contribuant directement à la stabilité alimentaire régionale et à la résilience climatique du continent.



[^1]: https://www.reinsurancene.ws/untapped-potential-in-africas-agricultural-insurance-market-faber/

[^2]: https://link.springer.com/article/10.1007/s11069-023-06388-x

[^3]: https://oko.finance/the-impact-of-mobile-technology-on-access-to-insurance-for-african-farmers/

[^4]: https://beinsure.com/agricultural-insurance-in-south-africa/

[^5]: https://www.equaltimes.org/agriculture-and-technology-index

[^6]: https://www.gsma.com/mobilefordevelopment/wp-content/uploads/2015/05/ACRE-Africa-Final-Report.pdf

[^7]: https://faberconsulting.ch/files/faber/pdf-pulse-reports/2023_AIP_e_final2_web.pdf

[^8]: https://www.ada-microfinance.org/sites/default/files/inline-files/1-oik-2020-index-insurance-in-west-africa_0.pdf

[^9]: https://m-omulimisa.com/services/mobile-based-agriculture-insurance/

[^10]: https://alliancebioversityciat.org/publications-data/index-based-agricultural-insurance-products-challenges-opportunities-and

[^11]: https://www.indexinsuranceforum.org/projects/by-region

[^12]: https://blogs.worldbank.org/en/peoplemove/mobile-money-platforms-for-agricultural-micro-insurance

[^13]: https://oneacrefund.org/publications/subsidizing-agricultural-insurance-sub-saharan-africa

[^14]: https://www.sciencedirect.com/science/article/pii/S0308521X24002804

[^15]: https://www.climatepolicyinitiative.org/gca-africa-adaptation-finance/case_studies/agriculture-and-climate-risk-enterprise-acre-2/

[^16]: https://oko.finance/how-agricultural-insurance-can-transform-small-farms-in-africa/

[^17]: https://arccjournals.com/journal/agricultural-science-digest/DF-622

[^18]: https://www.sciencedirect.com/science/article/pii/S2211912421000985

[^19]: https://www.financialprotectionforum.org/sites/default/files/Day 3_Session%202_ACRE%20Africa.pdf

[^20]: https://www.usgs.gov/news/satellite-data-show-promise-guide-west-african-crop-insurance

[^21]: https://african.business/2023/05/technology-information/west-africa-worlds-largest-growing-mobile-money-market-in-2022-says-gsma-report

[^22]: https://www.agdevco.com/news-and-resources/resources/article-reaching-farmers-through-bulk-sms-text-messaging-or-automated-voice-messaging/

[^23]: https://www.icpac.net/data-center/arc2/

[^24]: https://www.theigc.org/blogs/how-sierra-leone-can-join-west-africas-mobile-money-revolution

[^25]: https://developmenteducation.ie/blog/2018/10/12/farmers-using-mobile-phone-in-the-fight-against-poverty-and-hunger-across-africa/

[^26]: https://digitalearthafrica.org/en_za/satellite-data-for-sustainable-development/

[^27]: https://blog.seerbit.com/en/towards-cashless-societies-mobile-money-leading-the-way-in-west-africa

[^28]: http://www.ist-africa.org/home/outbox/ISTAfrica_Paper_ref_170_11927.pdf

[^29]: https://digitalearthafrica.org/en_za/

[^30]: https://techafricanews.com/2025/04/10/1-1-billion-mobile-money-accounts-whats-driving-africas-mobile-money-revolution/

[^31]: https://www.cifor-icraf.org/publications/downloads/Publications/PDFS/MM10320.pdf

[^32]: https://climatedataguide.ucar.edu/domains/africa

[^33]: https://www.afriex.com/resource-posts/africas-mobile-money-titans-top-providers-powering-financial-inclusion-by-region

[^34]: https://www.ictworks.org/12-reasons-why-farmers-do-not-use-mobile-agritech-services/

[^35]: https://www.climsa.org/programme-results/access-climate-information

[^36]: https://www.ecofinagency.com/finance/0904-46604-mobile-money-transactions-in-africa-surge-15-in-2024-gsma

[^37]: https://blog.africastalking.com/ishamba-providing-an-agricultural-lifeline-for-farmers-using-sms-and-voice-46a9f30f3a88

[^38]: http://www.eumetsat.int/climate-data-records

[^39]: https://www.gsma.com/sotir/wp-content/uploads/2025/04/The-State-of-the-Industry-Report-2025_English.pdf

[^40]: https://n2africa.org/exploring-farmers-intentions-adopt-mobile-short-message-service-sms-citizen-science-agriculture

[^41]: https://www.aagwa.org/methodology

[^42]: https://www.bisolusi.com/post/remote-sensing-for-flood-monitoring-in-agriculture-industry-with-sentinel-1-satellite

[^43]: https://alliancebioversityciat.org/publications-data/enhancing-climate-forecasting-west-africa-and-sahel

[^44]: https://digitalearthafrica.org/en_za/mean-ndvi-and-anomalies/

[^45]: https://www.nass.usda.gov/Research_and_Science/Disaster-Analysis/2017/Hurricane-Irma/Flood_Monitoring_Methodology_Paper.pdf

[^46]: https://www.undp.org/sites/g/files/zskgke326/files/2023-03/EN-AGRHYMET-Assessment_draft.pdf

[^47]: https://cropin.com/resource-blogs/ndvi-normalized-difference-vegetation-index/

[^48]: https://www.sciencedirect.com/science/article/pii/S0034425724004437

[^49]: https://servir.icrisat.org/weather-and-climate/

[^50]: https://registry.opendata.aws/deafrica-ndvi_climatology_ls/

[^51]: https://www.tandfonline.com/doi/full/10.1080/22797254.2024.2414004

[^52]: https://www.undp.org/sites/g/files/zskgke326/files/2023-03/EN_AGRHYMET%20Capacity%20Assessment%202022.pdf

[^53]: https://www.sciencedirect.com/science/article/pii/S2352938524000946

[^54]: https://nhess.copernicus.org/articles/22/2473/2022/

[^55]: http://ccr1-agrhymet.cilss.int/en/

[^56]: https://www.tandfonline.com/doi/full/10.1080/10106049.2023.2186492

[^57]: https://link.springer.com/article/10.1007/s41064-024-00275-1

[^58]: https://agrhymet.cilss.int/wp-content/uploads/2025/06/Bulletin_PRESASS042025_En-1.pdf

[^59]: https://agrhymet.cilss.int

[^60]: https://papers.ssrn.com/sol3/Delivery.cfm/SSRN_ID2518170_code2322436.pdf?abstractid=2518170\&mirid=1

[^61]: https://techafricanews.com/2024/10/31/africas-mobile-connectivity-has-the-internet-access-gap-narrowed-in-2024/

[^62]: https://datacup.io/en/blog/viajes-1/how-has-mobile-internet-penetration-developed-in-africa-40

[^63]: https://eleaf.com/index-insurance/

[^64]: https://www.atai-research.org/wp-content/uploads/2020/05/textfarmers1.pdf

[^65]: https://williamkamkwamba.com/african-countries-mobile-phones/

[^66]: https://www.indexinsuranceforum.org/blog/decade-agriculture-index-insurance-africa-looking-back-looking-forward

[^67]: https://www.connectingafrica.com/digital-divide/sub-saharan-africa-remains-the-least-connected-region-globally

[^68]: https://oneacrefund.org/sites/default/files/2024-09/2024.08 - White paper - Subsidizing Agricultural Insurance in sub-Saharan Africa_0.pdf

[^69]: https://www.sciencedirect.com/science/article/abs/pii/S0305750X1930172X

[^70]: https://lucidityinsights.com/infobytes/smartphone-penetration-rates-in-africa

[^71]: https://www.indexinsuranceforum.org/topic/premium-subsidies

[^72]: https://www.tandfonline.com/doi/full/10.1080/14735903.2020.1750796

[^73]: https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-economy/sub-saharan-africa/

[^74]: https://jamba.org.za/index.php/jamba/article/view/1611/2970

[^75]: https://www.kiwanja.net/blog/2009/11/sms-tackles-farmer-literacy-in-niger/

[^76]: https://www.geopoll.com/blog/mobile-phone-penetration-africa/

[^77]: https://borgenproject.org/kilimo-salama/

[^78]: https://www.financialprotectionforum.org/publication/transforming-agricultural-insurance-in-india-a-comprehensive-exploration-of-the-pradhan

[^79]: https://documents1.worldbank.org/curated/en/099021424123514286/pdf/P1720441022bcb0721a2711387ac6ccd404.pdf

[^80]: https://kilimosalama.wordpress.com/about/

[^81]: https://c4scourses.in/blog/pradhan-mantri-fasal-bima-yojana-pmfby-2/

[^82]: https://documents1.worldbank.org/curated/en/330501498850168402/pdf/When-and-How-Should-Agricultural-Insurance-be-Subsidized-Issues-and-Good-Practices.pdf

[^83]: https://www.indexinsuranceforum.org/project/kilimo-salama-safe-farming-weather-index-insurance-kenya-early-market-success

[^84]: https://www.nextias.com/blog/pradhan-mantri-fasal-bima-yojana-pmfby/

[^85]: https://openknowledge.worldbank.org/entities/publication/8a605230-3df5-5a4e-8996-5a6de07747e1

[^86]: https://documents1.worldbank.org/curated/en/963291468039041424/pdf/947940WP0Box380ture0Insurance0Final.pdf

[^87]: https://bosswallah.com/course/pradhan-mantri-fasal-bhima-yojana?lang=en

[^88]: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/808651467997877971/the-agricultural-insurance-development-program-aidp

[^89]: https://farm-d.org/document/kilimo-salama-safe-farming-weather-index-insurance-in-kenya-early-market-success/

[^90]: https://cgspace.cgiar.org/items/1c4fa3ba-d348-4899-87fc-fcbb5988aa1b

[^91]: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/698091468163160913/government-support-to-agricultural-insurance-challenges-and-options-for-developing-countries

[^92]: https://openknowledge.worldbank.org/entities/publication/edc6e40d-d637-5dac-916a-fed51a388e13

[^93]: https://www.insuranceinstituteofindia.com/documents/d/college-of-insurance/cp-23-crop-insurance-focus-pm-fasal-bima-yojana-ct

[^94]: https://www.worldbank.org/en/topic/financialsector/brief/agriculture-finance

[^95]: https://www.indexinsuranceforum.org/blog/ifc-climate-insurance-agtech-africa

[^96]: https://pmfby.gov.in


 chemin/vers/fichier

