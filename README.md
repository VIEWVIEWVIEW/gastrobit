# Projekt - SS2023 - Gastrobit.de
## Introduction

<img src="./next/doku/Gastrobit.svg" align="right"
     alt="Gastrobit Logo" width="120" height="178">

Gastrobit is an alternative to Lieferando.de (the german offshoot of Takeaway.com) and other food ordering platforms. On Gastrobit, restaurants can offer their food for pickup, or delivery by their own staff. Customers can customize and order food from the restaurant, and pay online. This project was done as part of the Software Engineering course at the University of Applied Sciences in Iserlohn, Germany. *This toy project is not intended to be a real product.*

* Easy ordering for customers.
* Restaurant owners can add food to the menu, and **configure
  available toppings, sizes,** and other options.
* Restaurant owners can **configure the delivery area via a map**.
* Restaurant owners can configure a ``*.gastrobit.de`` subdomain, or 
  **use their own domain**.
* Restaurant owners can select one from over **20 themes** for their
  restaurant page.
* Checkout via Stripe.

<p align="center">
  <img src="./next/doku/example-menu.PNG" alt="" width="800">
</p>


## Table of Contents
1. Introduction
2. Demo
3. Features
4. Technical Details


## Demo

If you just want to take a look at the restaurant page, you can check out **[marcpizzaland.gastrobit.de](https://marcpizzaland.gastrobit.de/)** (also reachable via a custom domain: [helloworld.wertfrei.org](helloworld.wertfrei.org)).


A demo of the application is available at [gastrobit.de](https://gastrobit.de). You can log in as a restaurant owner with the following credentials:
```
test@wertfrei.org
test123456
```


## Features

### Restaurant Owner

* **Have multiple restaurants**. You can have multiple restaurants, and configure them individually.
* **Add food to the menu**. You can add food to the menu, and configure available toppings, sizes, and other options. 
* **Configure the delivery area via a map**. You can configure the delivery area as a polygon via a map. On checkout, the customer's address is within that polygon via openstreetmap.org.
* **Accept / reject orders**. You can accept orders and update the status of the order ("Declined", "Open Order", "In Progress", "Delivered").
* **Custom domain**. You can use your own domain (via CNAME / A-Record), or a ``*.gastrobit.de`` subdomain.
* **Themes**. You can select one from over 20 themes for your restaurant page.
* **Stripe Express Dashboard**. You can log in to your Stripe Express Dashboard directly from the restaurant owner dashboard.

#### Screenshots
##### Delivery Area
<p align="center">
<img src="./next/doku/liefergebiet.png" alt="" width="800">
</p>

##### Menu

<p align="center">
<img src="./next/doku/menugif.gif" alt="" width="800">
</p>


### Customer

* **Easy ordering**. You can order food from restaurants, and customize it (e.g. toppings, sizes, etc.). 
* **Pay online**. You can pay online via Stripe.

I recommend using the demo to see the customer experience. [marcpizzaland.gastrobit.de](https://marcpizzaland.gastrobit.de/)


## Technical Details

### Architecture

I made it as cheap as possible for me to continue hosting the demo, so I used the following architecture:
- Application: Next.js (hosted on Vercel)
- Database: Supabase
- Storage: S3 at Supabase

#### Database Schema

<img src="./next/doku/DB.png" alt="">

##### Row Level Security

I used RLS to make sure that only resource owners can access their resources. For example, a restaurant owner can only access their own restaurants, can update orders which were create for their restaurants, etc. An example policy is shown below.
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Only restaurant owners can update orders
create policy "Nur Restaurantbesitzer können Bestellungen updaten"
  on orders
  for update using (
    auth.uid() IN (
      SELECT restaurants.owner_id
      FROM restaurants
      WHERE (restaurants.id = orders.restaurand_id) -- Small typo in the database: restaurand_id instead of restaurant_id
      )
    );

-- Everyone can insert orders
create policy "Jeder kann Bestellungen hinzufügen"
  on orders
  for insert WITH CHECK (
    true
  );
```