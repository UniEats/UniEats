INSERT INTO order_status (id, name) VALUES (1, 'confirmed') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (2, 'in preparation') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (3, 'finished') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (4, 'delivered') ON CONFLICT (id) DO NOTHING;
INSERT INTO order_status (id, name) VALUES (5, 'canceled') ON CONFLICT (id) DO NOTHING;
