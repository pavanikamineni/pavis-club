-- =======================================================
-- Pavi's Club - Demo Seed Data
-- =======================================================

USE pavis_club;

-- Insert Categories
INSERT INTO categories (id, name, slug, description, display_order) VALUES
(1, 'Starters', 'starters', 'Crispy, smoky, and tantalizing appetizers crafted to ignite your palate', 1),
(2, 'Main Course', 'main-course', 'Rich curries, royal gravies, and aromatic culinary creations', 2),
(3, 'Biryani', 'biryani', 'Aromatic dum-cooked basmati rice with exotic royal spices & tender meats', 3),
(4, 'Fast Food', 'fast-food', 'Gourmet burgers, stone-baked pizzas, and crispy clubhouse favourites', 4),
(5, 'Desserts', 'desserts', 'Handcrafted sweet indulgences to conclude your royal feast', 5),
(6, 'Beverages', 'beverages', 'Refreshing mocktails, creamy blends, and artisanal coolers', 6)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Menu Items
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, is_spicy, is_featured, is_available) VALUES
-- Starters
(1, 1, 'Tandoori Malai Paneer Tikka', 'Charcoal-grilled cottage cheese marinated in rich cream, cashew paste, and aromatic green cardamom.', 340.00, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 1),
(2, 1, 'Pavi\'s Royal Chicken Kebab', 'Succulent chicken morsels infused with saffron, mace, and royal Mughlai spices roasted in tandoor.', 420.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80', 0, 1, 1, 1),
(3, 1, 'Golden Tempura Prawns', 'Crisp batter-fried tiger prawns tossed with roasted garlic, cracked pepper, and sweet chilli glaze.', 490.00, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80', 0, 1, 0, 1),
(4, 1, 'Crispy Lotus Stem Honey Chilli', 'Wok-tossed lotus root slices glazed with mountain honey, sesame seeds, and scallions.', 310.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', 1, 1, 0, 1),

-- Main Course
(5, 2, 'Pavi\'s Butter Chicken Royale', 'Tandoor-smoked chicken simmered in a velvety sun-dried tomato and churned butter gravy.', 460.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', 0, 0, 1, 1),
(6, 2, 'Shahi Paneer Lazeez', 'Fresh paneer cubes poached in rich roasted cashew and saffron gravy with fragrant kasoori methi.', 380.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1),
(7, 2, 'Slow-Cooked Dal Pavi (36 Hours)', 'Black lentils gently simmered over slow charcoal embers overnight with farm churned white butter.', 320.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 1),
(8, 2, 'Rogan Josh Kashmiri', 'Tender boneless mutton cooked in aromatic Kashmiri red chillies, fennel, and whole brown spices.', 520.00, 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80', 0, 1, 0, 1),

-- Biryani
(9, 3, 'Pavi\'s Signature Dum Biryani', 'Our flagship mutton dum biryani layered with long-grain aged basmati, caramelized onions, and saffron essence.', 540.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 0, 1, 1, 1),
(10, 3, 'Hyderabadi Chicken Dum Biryani', 'Authentic Nizami slow-cooked chicken dum biryani served with spicy mirchi ka salan and burani raita.', 440.00, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80', 0, 1, 1, 1),
(11, 3, 'Subz Nizami Paneer Biryani', 'Exotic farm garden vegetables and marinated paneer cooked on gentle dum with aromatic mint leaves.', 360.00, 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1),

-- Fast Food
(12, 4, 'Truffle Brioche Burger', 'Handcrafted gourmet patty, smoked cheddar, truffle aioli, and crispy shallots on toasted brioche.', 360.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 0, 0, 1, 1),
(13, 4, 'Artisan Wood-Fired Margherita Pizza', 'San Marzano tomato base, fresh buffalo mozzarella, virgin olive oil, and sweet basil leaves.', 410.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1),
(14, 4, 'Pavi\'s Triple-Decker Club Sandwich', 'Smoked grilled fillings, lettuce, heirloom tomato, melted gouda, and herb mayo with spiced crisps.', 290.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1),
(15, 4, 'Parmesan Truffle Fries', 'Crispy hand-cut golden potato fries tossed with black truffle oil and freshly grated aged parmesan.', 220.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1),

-- Desserts
(16, 5, 'Saffron Shahi Tukda & Rabri', 'Golden fried brioche steeped in cardamom saffron syrup, blanketed with thick reduced clotted rabri.', 260.00, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 1),
(17, 5, 'Sizzling Belgian Brownie', 'Warm dark chocolate fudge brownie served on a smoking hot iron platter with Madagascar vanilla bean gelato.', 290.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 1),
(18, 5, 'Pistachio Kulfi Falooda', 'Traditional dense saffron-pistachio kulfi served with basil seeds, rose syrup, and fine vermicelli.', 240.00, 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1),

-- Beverages
(19, 6, 'Royal Kesar Badam Shake', 'Chilled whole milk infused with Kashmiri saffron strands, crushed almonds, and cardamom froth.', 220.00, 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 1),
(20, 6, 'Passionfruit & Mint Sparkler', 'Fresh passionfruit pulp, crushed garden mint, citrus lime, and sparkling soda over crushed ice.', 190.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1),
(21, 6, 'Signature Cold Brew Affogato', 'Double shot of artisan roasted espresso poured over creamy artisan vanilla ice cream.', 230.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);
