INSERT INTO message_categories (name) VALUES
('batch15');

INSERT INTO messages (category_id, content) VALUES
((SELECT id FROM message_categories WHERE name = 'batch15'), 'Tomoko should be in crash racing'),
((SELECT id FROM message_categories WHERE name = 'batch15'), 'Also Mario kart'),
((SELECT id FROM message_categories WHERE name = 'batch15'), 'Also Sonic kart'),
((SELECT id FROM message_categories WHERE name = 'batch15'), 'Best Collab ever'),
((SELECT id FROM message_categories WHERE name = 'batch15'), 'Also madness combat kart someday'),
((SELECT id FROM message_categories WHERE name = 'batch15'), 'Somewere in nevada 3 2 1 Gooo');