/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: clients
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: folio_edit_histories
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `folio_edit_histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `folioId` int DEFAULT NULL,
  `editorUserId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `folioId` (`folioId`),
  KEY `editorUserId` (`editorUserId`),
  CONSTRAINT `folio_edit_histories_ibfk_1` FOREIGN KEY (`folioId`) REFERENCES `folios` (`id`) ON DELETE
  SET
  NULL ON UPDATE CASCADE,
  CONSTRAINT `folio_edit_histories_ibfk_2` FOREIGN KEY (`editorUserId`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: folios
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `folios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `folioNumber` varchar(255) NOT NULL,
  `folioType` enum('Sencillo', 'Especial') NOT NULL,
  `deliveryDate` date NOT NULL,
  `deliveryTime` time NOT NULL,
  `persons` int NOT NULL,
  `cakeFlavor` text NOT NULL,
  `filling` text,
  `designDescription` text NOT NULL,
  `dedication` varchar(255) DEFAULT NULL,
  `deliveryLocation` varchar(255) NOT NULL,
  `total` decimal(10, 2) NOT NULL,
  `advancePayment` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `balance` decimal(10, 2) NOT NULL,
  `status` enum(
  'Nuevo',
  'En Producción',
  'Listo para Entrega',
  'Entregado',
  'Cancelado'
  ) DEFAULT 'Nuevo',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `responsibleUserId` int DEFAULT NULL,
  `clientId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folioNumber` (`folioNumber`),
  KEY `responsibleUserId` (`responsibleUserId`),
  KEY `clientId` (`clientId`),
  CONSTRAINT `folios_ibfk_1` FOREIGN KEY (`responsibleUserId`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL ON UPDATE CASCADE,
  CONSTRAINT `folios_ibfk_2` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE
  SET
  NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Administrador', 'Usuario', 'Decorador') NOT NULL DEFAULT 'Usuario',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: clients
# ------------------------------------------------------------

INSERT INTO
  `clients` (`id`, `name`, `phone`, `createdAt`, `updatedAt`)
VALUES
  (
    1,
    'Cliente de Prueba',
    '93278372823',
    '2025-09-30 01:23:21',
    '2025-09-30 01:23:21'
  );
INSERT INTO
  `clients` (`id`, `name`, `phone`, `createdAt`, `updatedAt`)
VALUES
  (
    2,
    'Enrique',
    '9611366965',
    '2025-09-30 01:25:53',
    '2025-09-30 01:25:53'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: folio_edit_histories
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: folios
# ------------------------------------------------------------

INSERT INTO
  `folios` (
    `id`,
    `folioNumber`,
    `folioType`,
    `deliveryDate`,
    `deliveryTime`,
    `persons`,
    `cakeFlavor`,
    `filling`,
    `designDescription`,
    `dedication`,
    `deliveryLocation`,
    `total`,
    `advancePayment`,
    `balance`,
    `status`,
    `createdAt`,
    `updatedAt`,
    `responsibleUserId`,
    `clientId`
  )
VALUES
  (
    2,
    'OS-25-6965',
    'Sencillo',
    '2025-10-25',
    '15:00:00',
    30,
    'Pan de chocolate',
    'Relleno de queso crema con zarzamora',
    'Decorado liso color blanco, con fresas frescas y frambuesas en la parte superior.',
    '¡Feliz Aniversario!',
    'Calle Falsa 123, Colonia Centro',
    950.00,
    500.00,
    450.00,
    'Nuevo',
    '2025-09-30 01:27:06',
    '2025-09-30 01:27:06',
    1,
    2
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------

INSERT INTO
  `users` (
    `id`,
    `username`,
    `email`,
    `password`,
    `role`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    'Isaac',
    'isaac@lafiesta.com',
    '$2b$10$/PCP5a2pzLMF6cjs/Hd03u.KN5r8yBymBHxvvsJf6k67p9L0ssi0.',
    'Administrador',
    '2025-09-30 01:26:31',
    '2025-09-30 01:26:31'
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
