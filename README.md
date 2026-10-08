# Smart Mart Inventory Management System

A frontend-only inventory management system that demonstrates the practical use of **Trie** and **Segment Tree** data structures in a real-world mart application.

The **Trie** is used for fast product-name searching, prefix-based autocomplete, and displaying the number of matching products. The **Segment Tree** is used for efficient range sales queries and updating individual product sales.

## Features

- Fast product search and autocomplete using Trie
- Range sales calculation using Segment Tree
- Update product sales dynamically
- Add new products
- Delete products
- Product category management
- Inventory and sales statistics
- Trie and Segment Tree visualization
- Responsive and user-friendly dashboard
- No database or backend required
- Runs completely in the browser

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Trie
- Segment Tree

## Data Structures

### Trie
Used for efficient prefix-based product searching and autocomplete.

### Segment Tree
Used for efficient range-sum queries and point updates on product sales.

## Example

Searching for:

`app`

can return:

- Apple
- Application Book
- Apricot

The Segment Tree can then calculate the total sales for any selected range of products and update the result when sales values change.

## Important

This project stores all data in browser memory and does not require a database, backend, or external API. Data will reset when the page is refreshed.

## Purpose

This project was developed to demonstrate how fundamental **Data Structures and Algorithms** can be applied to build a practical web application.
