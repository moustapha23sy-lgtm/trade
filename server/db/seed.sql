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
-- Parent categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Objets Publicitaires', 'objets-publicitaires', 'Cartes de visite, flyers, affiches, calendriers, broderie — votre identité visuelle.', 1),
('Électroménager', 'electromenager', 'Climatiseurs, réfrigérateurs, téléviseurs, machines à laver et bien plus.', 2),
('Hôtellerie', 'hotellerie', 'Gel, lotion, savon, shampooing — produits d''hygiène pour l''hôtellerie. Gamme Arganine.', 3);

-- Sub-categories: Objets Publicitaires (parent_id = 1)
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Cartes de visite', 'cartes-de-visite', 'Cartes de visite personnalisées', 1, 1),
('Flyers / Tracts', 'flyers-tracts', 'Flyers et tracts publicitaires', 1, 2),
('Affiches publicitaires', 'affiches-publicitaires', 'Affiches grand format', 1, 3),
('Plaquettes / Dépliants', 'plaquettes-depliants', 'Plaquettes et dépliants', 1, 4),
('Calendriers', 'calendriers', 'Calendriers personnalisés', 1, 5),
('Broderie', 'broderie', 'Broderie sur textile', 1, 6);

-- Sub-categories: Électroménager (parent_id = 2)
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Climatiseurs', 'climatiseurs', 'Climatiseurs split et mobiles', 2, 1),
('Réfrigérateurs', 'refrigerateurs', 'Réfrigérateurs et combinés', 2, 2),
('Cuisinières', 'cuisinieres', 'Cuisinières et plaques', 2, 3),
('Congélateurs', 'congelateurs', 'Congélateurs coffres et armoires', 2, 4),
('Machines à laver', 'machines-a-laver', 'Lave-linge automatiques', 2, 5),
('Téléviseurs', 'televiseurs', 'Téléviseurs LED, Smart TV', 2, 6),
('Micro-ondes', 'micro-ondes', 'Fours micro-ondes', 2, 7),
('Petit électroménager', 'petit-electromenager', 'Batteuses, aspirateurs, mixeurs...', 2, 8);

-- Sub-categories: Hôtellerie (parent_id = 3)
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Gel', 'gel', 'Gel douche hôtelier', 3, 1),
('Gel Cheveux', 'gel-cheveux', 'Gel cheveux hôtelier', 3, 2),
('Lotion', 'lotion', 'Lotion corporelle hôtelière', 3, 3),
('Savon Plissé', 'savon-plisse', 'Savon plissé hôtelier', 3, 4),
('Shampooing & Conditionneur', 'shampooing-conditionneur', 'Shampooing et conditionneur hôteliers', 3, 5),
('Gamme Arganine', 'gamme-arganine', 'Gamme premium Arganine pour hôtels', 3, 6);

-- ============================================
-- BRANDS (Marques)
-- ============================================
INSERT INTO brands (name, slug) VALUES
('LG', 'lg'),
('Samsung', 'samsung'),
('Hisense', 'hisense'),
('Smart Technology', 'smart-technology'),
('Decakila', 'decakila'),
('Camtech', 'camtech'),
('Lefon', 'lefon'),
('Arganine', 'arganine'),
('Trade Innovation', 'trade-innovation');

-- ============================================
-- PRODUCTS
-- ============================================

-- Objets Publicitaires
INSERT INTO products (name, slug, description, price, original_price, category_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('100 Cartes de visite personnalisées Bristol 250g', 'cartes-visite-bristol-250g', 'Cartes de visite professionnelles imprimées sur papier Bristol 250g. 100 exemplaires. Personnalisation recto/verso.', 10000, NULL, 4, 'CV-BRIS-100', 500, 'in_stock', '⚡ Promo', true, true),
('Flyers / Tracts — 1 000 exemplaires', 'flyers-tracts-1000', 'Flyers publicitaires imprimés recto/verso en couleur. Format A5 ou A4. 1 000 exemplaires.', 35000, 50000, 5, 'FLY-1000', 200, 'in_stock', '🏷️ Best', true, true),
('Broderie sur polo — prix unitaire dès 25 ex', 'broderie-polo-unitaire', 'Broderie logo sur polo. Prix unitaire à partir de 25 exemplaires. Qualité professionnelle.', 3500, NULL, 9, 'BROD-POLO-25', 100, 'in_stock', NULL, true, true),
('Calendrier personnalisé — 500 exemplaires', 'calendrier-personnalise-500', 'Calendrier mural personnalisé avec votre logo et images. 500 exemplaires.', 115000, NULL, 8, 'CAL-500', 50, 'in_stock', '⏳ Limité', true, true),
('Plaquette / Dépliant — dès 100 exemplaires', 'plaquette-depliant-100', 'Plaquette ou dépliant publicitaire. Impression couleur recto/verso. À partir de 100 exemplaires.', 27500, NULL, 7, 'PLAQ-100', 150, 'in_stock', NULL, true, true),
('Affiches publicitaires A3 — 100 exemplaires', 'affiches-a3-100', 'Affiches publicitaires format A3. Impression couleur haute qualité. 100 exemplaires.', 45000, NULL, 6, 'AFF-A3-100', 100, 'in_stock', NULL, true, false);

-- Climatiseurs
INSERT INTO products (name, slug, description, price, original_price, category_id, brand_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('SPLIT LG 9000 BTU Normal GAZ 410 S4C09TZCAA', 'split-lg-9000-btu', 'Climatiseur split LG 9000 BTU. Gaz R410. Installation rapide. Garantie constructeur.', 230000, NULL, 10, 1, 'LG-9000BTU', 15, 'in_stock', 'En stock', true, true);

-- Petit Électroménager
INSERT INTO products (name, slug, description, price, original_price, category_id, brand_id, sku, stock_quantity, stock_status, badge, is_published, is_featured) VALUES
('Aspirateur Samsung 1600W VCC4320S3A', 'aspirateur-samsung-1600w', 'Aspirateur Samsung 1600W avec sac. Puissance d''aspiration supérieure. Filtre HEPA.', 85000, NULL, 17, 2, 'SAM-VCC4320', 10, 'in_stock', 'Nouveau', true, true),
('Batteuse Lefon avec bol Noir/Gris LFSM6652', 'batteuse-lefon-lfsm6652', 'Batteuse Lefon avec bol en inox. 5 vitesses + pulse. Idéale pour la pâtisserie.', 20000, NULL, 17, 7, 'LEF-LFSM6652', 25, 'in_stock', 'Nouveau', true, true),
('Batteuse Smart Technology Électrique STPE815D', 'batteuse-smart-tech-stpe815d', 'Batteuse électrique Smart Technology. Design compact. 800W.', 15000, NULL, 17, 4, 'ST-STPE815D', 20, 'in_stock', 'Nouveau', true, false),
('Batteuse Decakila KEMG029B', 'batteuse-decakila-kemg029b', 'Batteuse Decakila KEMG029B. Puissante et robuste. Bol inox 5L.', 50000, NULL, 17, 5, 'DEC-KEMG029B', 8, 'in_stock', NULL, true, false),
('Aspirateur Camtech Vacuum Cleaner HW 1705B', 'aspirateur-camtech-hw1705b', 'Aspirateur Camtech haute performance. 1700W. Sans sac. Filtre lavable.', 60000, NULL, 17, 6, 'CAM-HW1705B', 12, 'in_stock', '⚡ Promo', true, false),
('Aspirateur Samsung 1800W VCC4540S36', 'aspirateur-samsung-1800w', 'Aspirateur Samsung 1800W avec technologie Twin Chamber. Ultra puissant.', 90000, NULL, 17, 2, 'SAM-VCC4540', 5, 'in_stock', NULL, true, false);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(1, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/Carte-de-visite-Mockup-1-400x400.jpg', true, 0),
(2, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/mockup-afficge-400x400.jpg', true, 0),
(3, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/Polo-400x400.jpg', true, 0),
(4, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/CALENDIER-400x400.jpg', true, 0),
(5, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/catalogue-400x400.jpg', true, 0),
(6, 'https://tradeinnovation-sn.com/wp-content/uploads/2021/09/mockup-afficge-400x400.jpg', true, 0),
(7, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/09/ed97b87d-af2d-4f59-b82b-1165e635b2ae-400x400.jpeg', true, 0),
(8, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/89ff2641-a948-4996-ad3b-801b30e9a6ec-2-400x400.jpg', true, 0),
(9, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/82fee14e-8493-4a12-91f8-e4c1024a17c8-400x400.jpg', true, 0),
(10, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/4fadf1a5-b5e9-496d-8609-357190a3b8a2-400x400.jpg', true, 0),
(11, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/b2b8f678-53d3-42a2-a1de-e107f0a70ff3-400x400.jpg', true, 0),
(12, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/71aa260b-022d-4b53-b202-dfd0867fda4d-400x400.jpg', true, 0),
(13, 'https://tradeinnovation-sn.com/wp-content/uploads/2025/12/80037fcb-951d-43d6-b3b1-d44d14f21571-400x400.jpg', true, 0);

-- ============================================
-- HERO SLIDES
-- ============================================
INSERT INTO hero_slides (tag, title, title_highlight, subtitle, cta_text, cta_link, image_url, sort_order, is_active) VALUES
('Objets Publicitaires', 'Votre Marque,', 'Notre Impact', 'Cartes de visite, flyers, affiches, broderie — donnez de la visibilité à votre entreprise.', 'Découvrir', '/categorie/objets-publicitaires', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1400&q=80', 1, true),
('Promo Rentrée 2026', 'Équipez votre', 'foyer', 'Climatiseurs LG, téléviseurs, réfrigérateurs, machines à laver — au meilleur prix à Dakar.', 'Voir les offres', '/categorie/electromenager', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80', 2, true),
('Gamme Hôtellerie', 'Gamme', 'Arganine', 'Produits d''hygiène premium pour hôtels, résidences et structures d''accueil.', 'Explorer', '/categorie/hotellerie', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&q=80', 3, true);

-- ============================================
-- PROMO CODES
-- ============================================
INSERT INTO promo_codes (code, type, value, min_order_amount, expires_at, is_active) VALUES
('FREE11CISKO', 'percentage', 11, 0, '2026-12-31 23:59:59', true),
('BIENVENUE10', 'percentage', 10, 15000, '2026-12-31 23:59:59', true),
('TRADE5000', 'fixed', 5000, 50000, '2026-06-30 23:59:59', true);
