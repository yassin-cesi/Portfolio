
DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `IdAddress` int NOT NULL AUTO_INCREMENT,
  `StreetNumber` int DEFAULT NULL,
  `StreetName` varchar(150) DEFAULT NULL,
  `PostalCode` int DEFAULT NULL,
  `City` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`IdAddress`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,1,'Rue du Portfolio',69000,'Lyon');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `language`
--

DROP TABLE IF EXISTS `language`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `language` (
  `IdLanguage` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  `Logo_Url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdLanguage`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `language`
--

LOCK TABLES `language` WRITE;
/*!40000 ALTER TABLE `language` DISABLE KEYS */;
INSERT INTO `language` VALUES (1,'C#','https://commons.wikimedia.org/wiki/File:Csharp_Logo.png'),(2,'SQL','https://www.pngegg.com/fr/png-dlhno'),(3,'HTML',NULL),(4,'CSS',NULL),(5,'JS',NULL),(6,'test',NULL),(7,'tes',NULL),(8,'GG',NULL);
/*!40000 ALTER TABLE `language` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `IdMessage` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Subject` varchar(255) DEFAULT NULL,
  `Content` text NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IdMessage`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--
--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `IdProject` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(100) NOT NULL,
  `Description` text,
  `Github_Link` varchar(255) DEFAULT NULL,
  `IdType` int DEFAULT NULL,
  `Github_Link_2` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdProject`),
  KEY `IdType` (`IdType`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`IdType`) REFERENCES `types` (`IdType`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (30,'Portfolio','test','https://github.com/yassin-cesi/Portfolio',6,NULL),(31,'WineShop APP','Dans le cadre d\'un projet de développement d\'un application lourde en cours, nous devions créer une application pour un caviste lui permettant de pouvoir gérer ces stock de vin, les ventes...','https://github.com/yassin-cesi/Projet_API.git',2,'https://github.com/daydeemile-arch/WineApi-Front.git'),(32,'test','test','https://github.com/yassin-cesi/Portfolio',6,NULL);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `project_images`
--

DROP TABLE IF EXISTS `project_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_images` (
  `IdImage` int NOT NULL AUTO_INCREMENT,
  `ImageUrl` varchar(255) NOT NULL,
  `IsMain` tinyint(1) DEFAULT '0',
  `IdProject` int DEFAULT NULL,
  PRIMARY KEY (`IdImage`),
  KEY `IdProject` (`IdProject`),
  CONSTRAINT `project_images_ibfk_1` FOREIGN KEY (`IdProject`) REFERENCES `projects` (`IdProject`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_images`
--

LOCK TABLES `project_images` WRITE;
/*!40000 ALTER TABLE `project_images` DISABLE KEYS */;
INSERT INTO `project_images` VALUES (64,'portfolio_index.png',1,30),(65,'portfolio_index_contact.png',0,30),(66,'winehope_stock_page.png',1,31),(67,'wineshop_accueil.png',0,31),(68,'wineshop_sales_page.png',0,31),(69,'winehope_stock_page.png',1,32);
/*!40000 ALTER TABLE `project_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_language`
--

DROP TABLE IF EXISTS `project_language`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_language` (
  `IdProject` int NOT NULL,
  `IdLanguage` int NOT NULL,
  PRIMARY KEY (`IdProject`,`IdLanguage`),
  KEY `IdLanguage` (`IdLanguage`),
  CONSTRAINT `project_language_ibfk_1` FOREIGN KEY (`IdProject`) REFERENCES `projects` (`IdProject`) ON DELETE CASCADE,
  CONSTRAINT `project_language_ibfk_2` FOREIGN KEY (`IdLanguage`) REFERENCES `language` (`IdLanguage`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_language`
--

LOCK TABLES `project_language` WRITE;
/*!40000 ALTER TABLE `project_language` DISABLE KEYS */;
INSERT INTO `project_language` VALUES (31,1),(30,2),(31,2),(30,3),(30,4),(30,5),(32,6);
/*!40000 ALTER TABLE `project_language` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `IdRole` int NOT NULL AUTO_INCREMENT,
  `Role` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`IdRole`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin'),(2,'User');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `types`
--

DROP TABLE IF EXISTS `types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `types` (
  `IdType` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  PRIMARY KEY (`IdType`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types`
--

LOCK TABLES `types` WRITE;
/*!40000 ALTER TABLE `types` DISABLE KEYS */;
INSERT INTO `types` VALUES (1,'CESI - Project Collaboratif '),(2,'CESI - Project Collaboratif'),(6,'Projet Personnel'),(8,'test'),(9,'GG');
/*!40000 ALTER TABLE `types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `IdUser` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(100) DEFAULT NULL,
  `LastName` varchar(100) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `IdRole` int NOT NULL DEFAULT '2',
  `Email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdUser`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Yassin','RIAHI','$2b$10$8et.VHLU5eI/J308BhWg1.VNy0ddSpgwXlwZseeIgybwDEcB2PXEu',1,'yassin.riahi@viacesi.fr');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-16 12:34:24
