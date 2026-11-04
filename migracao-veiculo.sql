USE a8;

ALTER TABLE Veiculo
  ADD COLUMN modelo VARCHAR(60),
  ADD COLUMN cor VARCHAR(20);

CREATE TABLE IF NOT EXISTS Veiculo_Empresa (
  placa VARCHAR(7) NOT NULL,
  fkemail VARCHAR(255) NOT NULL,
  f_CNPJ VARCHAR(14) NOT NULL,

  CONSTRAINT Pk_VeiculoEmpresa
    PRIMARY KEY (placa, fkemail, f_CNPJ),
  CONSTRAINT Fk_VeiculoEmpresa_Veiculo
    FOREIGN KEY (placa, fkemail) REFERENCES Veiculo(placa, fkemail)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT Fk_VeiculoEmpresa_Empresa
    FOREIGN KEY (f_CNPJ) REFERENCES Empresa(CNPJ)
      ON DELETE CASCADE ON UPDATE CASCADE
);