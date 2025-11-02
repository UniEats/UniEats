INSERT INTO order_status (id, name) VALUES (1, 'initiated') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (2, 'confirmed') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (3, 'in preparation') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (4, 'finished') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (5, 'delivered') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (6, 'canceled') ON CONFLICT (id) DO NOTHING;
