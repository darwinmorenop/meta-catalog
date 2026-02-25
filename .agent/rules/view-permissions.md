---
trigger: always_on
---

Las vistas están orientadas a que se usen dependiente del perfil del usuario.
Module,Feature,Free,Basic,Pro,Ultra,Admin
Store,Store,TRUE,TRUE,TRUE,TRUE,TRUE
Store,Cart,TRUE,TRUE,TRUE,TRUE,TRUE
Products,Favorities,TRUE,TRUE,TRUE,TRUE,TRUE
Products,Custom lists,FALSE,TRUE,TRUE,TRUE,TRUE
Products,Tracking,FALSE,TRUE,TRUE,TRUE,TRUE
Products,Stock-notifier,FALSE,TRUE,TRUE,TRUE,TRUE
Products,Prices,FALSE,FALSE,TRUE,TRUE,TRUE
Products,Inventory. Sales,FALSE,FALSE,TRUE,TRUE,TRUE
Products,Inventory. Stock-entry,FALSE,FALSE,FALSE,TRUE,TRUE
Products,Inventory. Movements,FALSE,FALSE,FALSE,TRUE,TRUE
Products,General,FALSE,FALSE,FALSE,FALSE,TRUE
Products,Media,FALSE,FALSE,FALSE,FALSE,TRUE
Products,Scrap,FALSE,FALSE,FALSE,FALSE,TRUE
Inbound,Documents,FALSE,FALSE,FALSE,TRUE,TRUE
Inbound,Register,FALSE,FALSE,FALSE,TRUE,TRUE
Sales,Documents,FALSE,FALSE,TRUE,TRUE,TRUE
Sales,Register,FALSE,FALSE,FALSE,TRUE,TRUE
Users,Agenda,FALSE,FALSE,TRUE,TRUE,TRUE
Users,Manager,FALSE,FALSE,FALSE,TRUE,TRUE
Users,Profiles,FALSE,FALSE,FALSE,FALSE,TRUE
Admin,Campaigns,FALSE,FALSE,FALSE,FALSE,TRUE
Admin,Categories,FALSE,FALSE,FALSE,FALSE,TRUE
Admin,Scrap,FALSE,FALSE,FALSE,FALSE,TRUE