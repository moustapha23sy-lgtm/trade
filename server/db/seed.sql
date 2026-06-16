-- ============================================
-- Trade Innovation — Seed Data
-- ============================================

-- ============================================
-- ADMIN USER (password: Admin@2026!)
-- Hash generated with bcryptjs, 10 rounds
-- ============================================
INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
VALUES (
    'admin@tradeinnovation.sn',
    '$2a$10$placeholder_will_be_set_by_seed_script',
    'Dior',
    'Yade',
    '+221776510361',
    'admin'
);

-- ============================================
-- CATEGORIES
-- ============================================
-- Niveau 0 : Pôles (parent_id = NULL)
-- id=1 : Objets Publicitaires
-- id=2 : Électroménager
-- id=3 : Fournitures et Équipement Hôtelier
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Objets Publicitaires',              'objets-publicitaires',          'Objets promotionnels, textile personnalisé, signalétique et impression.', 1),
('Électroménager',                    'electromenager',                'Climatiseurs, réfrigérateurs, téléviseurs, machines à laver et bien plus.', 2),
('Fournitures et Équipement Hôtelier','fournitures-equipement-hotelier','Équipements de chambre, linge hôtelier, salle de bain et produits d''accueil.', 3);

-- Niveau 1 : Catégories directes sous Objets Publicitaires (parent_id=1)
-- id=4 : Objets promotionnels
-- id=5 : Textile personnalisé
-- id=6 : Signalétique & Impression
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('Objets promotionnels',   'objets-promotionnels',   1, 1),
('Textile personnalisé',   'textile-personnalise',   1, 2),
('Signalétique & Impression','signaletique-impression',1, 3);

-- Niveau 1 : Catégories directes sous Électroménager (parent_id=2)
-- id=7 : Climatiseurs
-- id=8 : Réfrigérateurs
-- id=9 : Cuisinières
-- id=10: Congélateurs
-- id=11: Machines à laver
-- id=12: Téléviseurs
-- id=13: Micro-ondes
-- id=14: Petit électroménager
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('Climatiseurs',       'climatiseurs',      2, 1),
('Réfrigérateurs',     'refrigerateurs',    2, 2),
('Cuisinières',        'cuisinieres',       2, 3),
('Congélateurs',       'congelateurs',      2, 4),
('Machines à laver',   'machines-a-laver',  2, 5),
('Téléviseurs',        'televiseurs',       2, 6),
('Micro-ondes',        'micro-ondes',       2, 7),
('Petit électroménager','petit-electromenager',2, 8);

-- Niveau 1 : Catégories intermédiaires sous Fournitures et Équipement Hôtelier (parent_id=3)
-- id=15: Fournitures
-- id=16: Équipements
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('Fournitures',  'fournitures',  3, 1),
('Équipements',  'equipements',  3, 2);

-- Niveau 2 : Sous-catégories de Fournitures (parent_id=15)
-- id=17: Linge Hôtelier
-- id=18: Produits d'accueil (Amenities)
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('Linge Hôtelier',               'linge-hotelier',              15, 1),
('Produits d''accueil (Amenities)','produits-accueil-amenities',  15, 2);

-- Niveau 2 : Sous-catégories de Équipements (parent_id=16)
-- id=19: Équipement de chambre
-- id=20: Salle de bain
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('Équipement de chambre', 'equipement-de-chambre', 16, 1),
('Salle de bain',         'salle-de-bain',          16, 2);

-- ============================================
-- BRANDS (Marques)
-- ============================================
INSERT INTO brands (name, slug) VALUES
('LG',               'lg'),
('Samsung',          'samsung'),
('Hisense',          'hisense'),
('Smart Technology', 'smart-technology'),
('Decakila',         'decakila'),
('Camtech',          'camtech'),
('Lefon',            'lefon'),
('Arganine',         'arganine'),
('Trade Innovation', 'trade-innovation');

-- ============================================
-- PRODUCTS
-- Les items "feuilles" (Stylo, Flyers, T-shirts, etc.)
-- sont des PRODUITS rattachés à leur catégorie parente.
-- ============================================

-- Objets promotionnels (category_id=4)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Stylo personnalisé',         'stylo-personnalise',          'Stylo publicitaire gravé ou imprimé avec votre logo. Minimum 50 exemplaires.',  2500, NULL, 4, 'OBJ-STYLO',     500, 'in_stock', NULL,        true, false),
('Carnet personnalisé',        'carnet-personnalise',         'Carnet publicitaire couverture rigide avec logo. Minimum 50 exemplaires.',        4500, NULL, 4, 'OBJ-CARNET',    300, 'in_stock', NULL,        true, false),
('Clé USB personnalisée',      'cle-usb-personnalisee',       'Clé USB 16 Go avec impression de votre logo. Livraison rapide.',                 7500, NULL, 4, 'OBJ-CLEUSB',    200, 'in_stock', '⚡ Promo',   true, true),
('Gourde publicitaire',        'gourde-publicitaire',         'Gourde isotherme personnalisée. Capacité 500ml. Sérigraphie ou gravure laser.',  6000, NULL, 4, 'OBJ-GOURDE',    150, 'in_stock', NULL,        true, false),
('Mug personnalisé',           'mug-personnalise',            'Mug céramique 330ml avec impression photo ou logo. Sublimation haute qualité.',  3500, NULL, 4, 'OBJ-MUG',       400, 'in_stock', NULL,        true, false),
('Porte-clés personnalisé',    'porte-cles-personnalise',     'Porte-clés métal ou plastique avec logo gravé. Minimum 100 pièces.',             1500, NULL, 4, 'OBJ-PORTECLES', 600, 'in_stock', NULL,        true, false);

-- Textile personnalisé (category_id=5)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('T-shirt personnalisé',       't-shirt-personnalise',        'T-shirt 100% coton sérigraphié ou brodé avec votre logo. Dès 25 exemplaires.',   4500, NULL, 5, 'TEX-TSHIRT',    200, 'in_stock', NULL,        true, true),
('Broderie sur polo',          'broderie-polo-unitaire',      'Broderie logo sur polo. Prix unitaire à partir de 25 exemplaires. Qualité professionnelle.', 3500, NULL, 5, 'TEX-POLO', 100, 'in_stock', NULL, true, true),
('Casquette personnalisée',    'casquette-personnalisee',     'Casquette brodée ou imprimée. Réglable. Minimum 30 pièces.',                      3000, NULL, 5, 'TEX-CASQ',      150, 'in_stock', NULL,        true, false),
('Sac personnalisé',           'sac-personnalise',            'Sac non-tissé ou toile personnalisé avec logo. Idéal pour événements.',           2000, NULL, 5, 'TEX-SAC',       300, 'in_stock', NULL,        true, false),
('Uniforme sur mesure',        'uniforme-sur-mesure',         'Uniforme professionnel brodé. Tailleur partenaire. Devis sur demande.',           15000,NULL, 5, 'TEX-UNI',        50, 'in_stock', '📞 Devis',  true, false);

-- Signalétique & Impression (category_id=6)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Panneau publicitaire',       'panneau-publicitaire',        'Panneau rigide PVC ou aluminium. Impression UV haute définition. Sur mesure.',   25000,NULL, 6, 'SIG-PAN',        80, 'in_stock', NULL,        true, false),
('Plaque gravée',              'plaque-gravee',               'Plaque signalétique en aluminium ou PVC gravée. Formats standards ou sur mesure.',15000,NULL, 6, 'SIG-PLAQ',       60, 'in_stock', NULL,        true, false),
('Bâche publicitaire',         'bache-publicitaire',          'Bâche imprimée 440g/m². Oeillets soudés. Format sur mesure.',                    18000,NULL, 6, 'SIG-BACH',      100, 'in_stock', NULL,        true, false),
('Roll-up publicitaire',       'roll-up-publicitaire',        'Roll-up 85x200cm avec impression et housse de transport. Livraison rapide.',     35000,NULL, 6, 'SIG-ROLLUP',     40, 'in_stock', '⚡ Promo',   true, true),
('Stickers personnalisés',     'stickers-personnalises',      'Stickers découpe à la forme. Vinyle résistant intérieur/extérieur.',              8000, NULL, 6, 'SIG-STICK',     200, 'in_stock', NULL,        true, false),
('100 Cartes de visite Bristol 250g','cartes-visite-bristol-250g','Cartes de visite professionnelles imprimées sur papier Bristol 250g. 100 exemplaires. Personnalisation recto/verso.',10000,NULL,6,'SIG-CDVBRIS',500,'in_stock','⚡ Promo',true,true),
('Flyers / Tracts — 1 000 ex','flyers-tracts-1000',           'Flyers publicitaires imprimés recto/verso en couleur. Format A5 ou A4. 1 000 exemplaires.', 35000,50000,6,'SIG-FLY1000',200,'in_stock','🏷️ Best',true,true),
('Dépliant / Plaquette',       'depliant-plaquette',          'Plaquette ou dépliant publicitaire. Impression couleur recto/verso. À partir de 100 exemplaires.',27500,NULL,6,'SIG-PLAQ100',150,'in_stock',NULL,true,false),
('Bloc-note publicitaire',     'bloc-note-publicitaire',      'Bloc-note couverture personnalisée. 50 feuilles. À partir de 100 pièces.',        5000, NULL, 6, 'SIG-BLOC',       80, 'in_stock', NULL,        true, false),
('Affiches A3 — 100 ex',      'affiches-a3-100',             'Affiches publicitaires format A3. Impression couleur haute qualité. 100 exemplaires.',45000,NULL,6,'SIG-AFFA3',100,'in_stock',NULL,true,false);

-- Climatiseurs (category_id=7)
INSERT INTO products (name, slug, description, price, original_price, category_id, brand_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('SPLIT LG 9000 BTU Normal GAZ 410 S4C09TZCAA','split-lg-9000-btu','Climatiseur split LG 9000 BTU. Gaz R410. Installation rapide. Garantie constructeur.',230000,NULL,7,1,'LG-9000BTU',15,'in_stock','En stock',true,true);

-- Petit électroménager (category_id=14)
INSERT INTO products (name, slug, description, price, original_price, category_id, brand_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Aspirateur Samsung 1600W VCC4320S3A',  'aspirateur-samsung-1600w',  'Aspirateur Samsung 1600W avec sac. Puissance d''aspiration supérieure. Filtre HEPA.',85000,NULL,14,2,'SAM-VCC4320',10,'in_stock','Nouveau',true,true),
('Batteuse Lefon avec bol Noir/Gris LFSM6652','batteuse-lefon-lfsm6652','Batteuse Lefon avec bol en inox. 5 vitesses + pulse. Idéale pour la pâtisserie.',20000,NULL,14,7,'LEF-LFSM6652',25,'in_stock','Nouveau',true,true),
('Batteuse Smart Technology Électrique STPE815D','batteuse-smart-tech-stpe815d','Batteuse électrique Smart Technology. Design compact. 800W.',15000,NULL,14,4,'ST-STPE815D',20,'in_stock','Nouveau',true,false),
('Batteuse Decakila KEMG029B',           'batteuse-decakila-kemg029b','Batteuse Decakila KEMG029B. Puissante et robuste. Bol inox 5L.',50000,NULL,14,5,'DEC-KEMG029B',8,'in_stock',NULL,true,false),
('Aspirateur Camtech Vacuum Cleaner HW 1705B','aspirateur-camtech-hw1705b','Aspirateur Camtech haute performance. 1700W. Sans sac. Filtre lavable.',60000,NULL,14,6,'CAM-HW1705B',12,'in_stock','⚡ Promo',true,false),
('Aspirateur Samsung 1800W VCC4540S36',  'aspirateur-samsung-1800w',  'Aspirateur Samsung 1800W avec technologie Twin Chamber. Ultra puissant.',90000,NULL,14,2,'SAM-VCC4540',5,'in_stock',NULL,true,false);

-- Linge Hôtelier (category_id=17)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Draps',                              'draps-hoteliers',             'Draps professionnels hôteliers. Coton blanc 200 fils. Lavage industriel.',8500,NULL,17,'LINGE-DRAPS',100,'in_stock',NULL,true,true),
('Housses de couette',                 'housses-de-couette',          'Housses de couette hôtelières. Coton percale.',                           7500,NULL,17,'LINGE-HOUS', 100,'in_stock',NULL,true,true),
('Oreilles et couette',                'oreilles-et-couette',         'Couettes et oreillers garnissage microfibres. Toutes tailles disponibles.',6500,NULL,17,'LINGE-COUE',  80,'in_stock',NULL,true,false),
('Serviettes',                         'serviettes',                  'Serviettes de bain éponge 500g/m². Broderie disponible.',                 4500,NULL,17,'LINGE-SERV', 150,'in_stock',NULL,true,true),
('Peignoir',                           'peignoir',                    'Peignoirs éponge hôteliers.',                                             8500,NULL,17,'LINGE-PEIG', 100,'in_stock',NULL,true,false),
('Tapis',                              'tapis-bain',                  'Tapis de bain hôteliers.',                                                2500,NULL,17,'LINGE-TAPIS',200,'in_stock',NULL,true,false);

-- Produits d'accueil / Amenities (category_id=18)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Savon & Shampoing',                  'savon-shampoing',             'Savon et shampoings miniatures pour hôtel. Vente par carton de 100 pièces.',      15000,NULL,18,'ACC-SAVON',  50,'in_stock',NULL,true,true),
('Gel de douche & Lotion',             'gel-douche-lotion',           'Gel de douche et lotion corps. Flacon 30ml. Carton de 100 pièces.',                12000,NULL,18,'ACC-GEL',    60,'in_stock',NULL,true,false),
('Kit dentaire',                       'kit-dentaire',                'Kit brosse à dents + dentifrice ou rasoir + gel. Vente par carton.',               18000,NULL,18,'ACC-KIT',    40,'in_stock',NULL,true,false),
('Chausson & Bonnets de douche',       'chausson-bonnets-douche',     'Chaussons jetables et bonnets de douche. Carton de 100 pièces.',                    8000,NULL,18,'ACC-CHUSS',  80,'in_stock',NULL,true,false),
('Distributeurs et emballages',        'distributeurs-emballages',    'Distributeurs de savon liquide et emballages pour amenities. Sur devis.',          25000,NULL,18,'ACC-DISTR',  20,'in_stock','📞 Devis',true,false);

-- Équipement de chambre (category_id=19)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('lits & matelas',                     'lits-matelas',                'Lits et matelas professionnels pour hôtel. Standards simple, double, king-size.',120000,NULL,19,'EQUIP-LIT',  20,'in_stock',NULL,true,true),
('Mobilier de chambre',                'mobilier-de-chambre',         'Mobilier complet chambre hôtel : bureau, chevet, commode. Sur devis.',            85000,NULL,19,'EQUIP-MOB',  15,'in_stock','📞 Devis',true,false),
('Coffres-forts',                      'coffres-forts',               'Coffre-fort électronique pour chambre hôtel. Code ou carte.',                      45000,NULL,19,'EQUIP-COFFRE',30,'in_stock',NULL,true,false),
('Minibars',                           'minibars',                    'Minibar encastrable ou posable. 30 à 60L. Marques professionnelles.',              95000,NULL,19,'EQUIP-MINI', 10,'in_stock',NULL,true,false),
('TV & accessoires',                   'tv-accessoires',              'Téléviseurs pour hôtel avec support mural et câblage IPTV disponible.',            75000,NULL,19,'EQUIP-TV',   25,'in_stock',NULL,true,true),
('Rideaux',                            'rideaux',                     'Rideaux occultants et voilages pour chambre hôtel. Pose incluse sur devis.',       35000,NULL,19,'EQUIP-RID',  40,'in_stock',NULL,true,false);

-- Salle de bain (category_id=20)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Seche-cheveux',                      'seche-cheveux',               'Sèche-cheveux mural professionnel 1800W. Fixation facile. Garanti 2 ans.',         18000,NULL,20,'SDB-SECHE',  50,'in_stock',NULL,true,true),
('Distributeur de savons',             'distributeur-de-savons',      'Distributeur de savon liquide mural en inox ou plastique ABS. 300 ou 500ml.',     12000,NULL,20,'SDB-DISTR',  60,'in_stock',NULL,true,false),
('Accessoires sanitaire',              'accessoires-sanitaire',       'Ensemble accessoires salle de bain hôtel : porte-serviette, brosse WC, miroir.',   25000,NULL,20,'SDB-ACCESS', 35,'in_stock',NULL,true,false),
('Poubelles et portes serviettes',     'poubelles-portes-serviettes', 'Poubelles à pédale et porte-serviette inox. Qualité hôtelière.',                   15000,NULL,20,'SDB-POB',    45,'in_stock',NULL,true,false);

-- Calendrier (Signalétique — category_id=6)
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Calendrier personnalisé — 500 ex','calendrier-personnalise-500','Calendrier mural personnalisé avec votre logo et images. 500 exemplaires.',115000,NULL,6,'SIG-CAL500',50,'in_stock','⏳ Limité',true,true);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(16, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/Carte-de-visite-Mockup-1-400x400.jpg', true, 0),
(17, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/mockup-afficge-400x400.jpg',           true, 0),
(8,  'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/Polo-400x400.jpg',                     true, 0),
(28, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/CALENDIER-400x400.jpg',                true, 0),
(18, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/catalogue-400x400.jpg',                true, 0),
(20, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/mockup-afficge-400x400.jpg',           true, 0),
(22, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/09/ed97b87d-af2d-4f59-b82b-1165e635b2ae-400x400.jpeg', true, 0),
(23, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/89ff2641-a948-4996-ad3b-801b30e9a6ec-2-400x400.jpg', true, 0),
(24, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/82fee14e-8493-4a12-91f8-e4c1024a17c8-400x400.jpg',  true, 0),
(25, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/4fadf1a5-b5e9-496d-8609-357190a3b8a2-400x400.jpg',  true, 0),
(26, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/b2b8f678-53d3-42a2-a1de-e107f0a70ff3-400x400.jpg',  true, 0),
(27, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/71aa260b-022d-4b53-b202-dfd0867fda4d-400x400.jpg',  true, 0),
(22, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/80037fcb-951d-43d6-b3b1-d44d14f21571-400x400.jpg',  false, 1);

-- ============================================
-- HERO SLIDES
-- ============================================
INSERT INTO hero_slides (tag, title, title_highlight, subtitle, cta_text, cta_link, image_url, sort_order, is_active) VALUES
('Objets Publicitaires',   'Votre Marque,',    'Notre Impact',       'Objets promotionnels, textile personnalisé, signalétique et impression.',                                      'Découvrir', '/category/objets-publicitaires',           'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1400&q=80', 1, true),
('Promo Rentrée 2026',     'Équipez votre',    'foyer',              'Climatiseurs LG, téléviseurs, réfrigérateurs, machines à laver — au meilleur prix à Dakar.',                  'Voir les offres', '/category/electromenager',           'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80', 2, true),
('Fournitures Hôtelières', 'Équipez votre',    'établissement',      'Équipements de chambre, linge hôtelier, salle de bain et produits d''accueil premium.',                       'Explorer', '/category/fournitures-equipement-hotelier', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&q=80', 3, true);

-- ============================================
-- PROMO CODES
-- ============================================
INSERT INTO promo_codes (code, type, value, min_order_amount, expires_at, is_active) VALUES
('FREE11CISKO', 'percentage', 11, 0,     '2026-12-31 23:59:59', true),
('BIENVENUE10', 'percentage', 10, 15000, '2026-12-31 23:59:59', true),
('TRADE5000',   'fixed',    5000, 50000, '2026-06-30 23:59:59', true);
