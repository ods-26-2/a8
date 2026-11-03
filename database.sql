Create database if not exists a8;
USE a8;

create table Empresa(
	CNPJ VARCHAR(14) NOT NULL,
    Nome VARCHAR(255),
    email VARCHAR(255),
    senha VARCHAR(255),
    Tipo VARCHAR(15),
    User_cadastra boolean,
    
    constraint PkEmpresa
		primary key (CNPJ)
);

ALTER TABLE Empresa ADD CONSTRAINT uq_empresa_email UNIQUE (email);

create table Usuario(
	email VARCHAR(255),
    Nome VARCHAR(255),
    senha VARCHAR(255),
    CPF VARCHAR(11) unique,

	constraint PkUsuario
		primary key(email)
);

create table Empresa_Usuario(
	f_CNPJ VARCHAR(14) NOT NULL,
    f_email VARCHAR(255),
	
    constraint PkEmpresa_usuario
		primary key(f_email, f_CNPJ),
	constraint Fk_Empresa
		foreign key(f_CNPJ) references Empresa(CNPJ)
			on delete cascade on update cascade,
	constraint Fk_Usuario
		foreign key(f_email) references Usuario(email)
			on delete cascade on update cascade
);

create table Empresa_Adm(
	f_CNPJ VARCHAR(14) NOT NULL,
    f_email VARCHAR(255),
	
    constraint PkEmpresa_Adm
		primary key(f_email, f_CNPJ),
	constraint Fk_EmpresaAdm
		foreign key(f_CNPJ) references Empresa(CNPJ)
			on delete cascade on update cascade,
	constraint Fk_UsuarioAdm
		foreign key(f_email) references Usuario(email)
			on delete cascade on update cascade
);

create table Veiculo(
	placa VARCHAR(7),
    fkemail VARCHAR(255),
    modelo VARCHAR(60),
    cor VARCHAR(20),

    constraint Pk_Veiculo
		primary key(placa, fkemail),
	constraint fk_usuarioVeiculo
		foreign key(fkemail) references Usuario(email)
			on delete cascade on update cascade
);

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

create table Veiculo_Convidado(
	placa VARCHAR(7),
    f_CNPJ VARCHAR(14) NOT NULL,
    fkemail VARCHAR(255),
    data_entrada datetime,
    data_saida datetime,
	
    constraint Pk_Convidado
		primary key(placa, f_CNPJ, fkemail),
	constraint fk_usuarioConvidado
		foreign key(fkemail) references Usuario(email)
			on delete cascade on update cascade,
	constraint Fk_EmpresaConvidado
		foreign key(f_CNPJ) references Empresa(CNPJ)
			on delete cascade on update cascade
);
