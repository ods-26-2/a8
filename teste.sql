INSERT INTO Empresa (CNPJ, Nome, email, senha, Tipo, User_cadastra) VALUES
('11111111000111', 'Condominio dos Sonhos', 'sonhos@teste.com', '$2b$10$xE0uxALU2GdimUB6xHC.Puj4wYdY7AzWLfct3chW.07Id2MqvdRv.', 'condominio', true),
('22222222000122', 'Patio Matasinhos', 'patio@teste.com', '$2b$10$xE0uxALU2GdimUB6xHC.Puj4wYdY7AzWLfct3chW.07Id2MqvdRv.', 'empresa', true);

INSERT INTO Empresa_Adm (f_CNPJ, f_email) VALUES ('11111111000111', 'claudio@gmail.com');

INSERT INTO Empresa_Usuario (f_CNPJ, f_email) VALUES ('22222222000122', 'claudio@gmail.com');