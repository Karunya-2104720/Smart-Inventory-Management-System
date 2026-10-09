const demoProducts = [
  { name: "Apple", sales: 20 },
  { name: "Book", sales: 15 },
  { name: "Apron", sales: 10 },
  { name: "Banana", sales: 25 },
  { name: "Book", sales: 30 },
  { name: "Computer", sales: 18 },
  { name: "Keyboard", sales: 12 },
  { name: "Laptop", sales: 22 },
  { name: "Mouse", sales: 16 },
  { name: "Pencil", sales: 14 },
  { name: "Orange", sales: 36 },
  { name: "Mango", sales: 40 },
  { name: "Tomato", sales: 48 },
  { name: "Potato", sales: 50 },
  { name: "Milk", sales: 60 },
  { name: "Cheese", sales: 31 },
  { name: "Bread", sales: 45 },
  { name: "Coffee", sales: 45 },
  { name: "Tea", sales: 50 },
  { name: "Basmati Rice", sales: 42 },
  { name: "Sugar", sales: 55 },
  { name: "Salt", sales: 52 },
  { name: "Bath Soap", sales: 38 },
  { name: "Shampoo", sales: 42 },
  { name: "Toothpaste", sales: 48 },
  { name: "Washing Powder", sales: 45 },
  { name: "Notebook", sales: 55 },
  { name: "Eraser", sales: 35 },
  { name: "Water Bottle", sales: 30 },
  { name: "USB Cable", sales: 30 }
];

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.word = "";
    this.productIndex = -1;
    this.productIndices = new Set();
    this.passingProductIndices = new Set();
    this.count = 0;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  normalize(value) {
    return String(value).trim().toLowerCase();
  }

  insert(word, productIndex, displayName) {
    const normalized = this.normalize(word);
    if (!normalized) {
      return;
    }

    let current = this.root;
    if (!current.passingProductIndices.has(productIndex)) {
      current.passingProductIndices.add(productIndex);
      current.count += 1;
    }
    for (const character of normalized) {
      if (!current.children[character]) {
        current.children[character] = new TrieNode();
      }
      current = current.children[character];
      if (!current.passingProductIndices.has(productIndex)) {
        current.passingProductIndices.add(productIndex);
        current.count += 1;
      }
    }

    current.isEndOfWord = true;
    current.productIndices.add(productIndex);
    current.productIndex = current.productIndices.values().next().value ?? -1;
    current.word = displayName || word;
  }

  searchPrefix(prefix) {
    const normalized = this.normalize(prefix);
    if (!normalized) {
      return [];
    }

    let current = this.root;
    for (const character of normalized) {
      if (!current.children[character]) {
        return [];
      }
      current = current.children[character];
    }

    const matches = [];
    const seen = new Set();
    this.collectMatches(current, matches, seen);
    return matches;
  }

  collectMatches(node, matches, seen) {
    if (node.isEndOfWord) {
      for (const productIndex of node.productIndices) {
        if (!seen.has(productIndex)) {
          seen.add(productIndex);
          matches.push({ index: productIndex });
        }
      }
    }

    const entries = Object.entries(node.children).sort(([left], [right]) => left.localeCompare(right));
    for (const [, childNode] of entries) {
      this.collectMatches(childNode, matches, seen);
    }
  }
}

class SegmentTree {
  constructor(values = []) {
    this.values = [...values];
    this.size = this.values.length;
    this.tree = new Array(this.size * 4 + 5).fill(0);
    this.lastQueryPath = new Set();

    if (this.size > 0) {
      this.build(1, 0, this.size - 1);
    }
  }

  build(node, left, right) {
    if (left === right) {
      this.tree[node] = this.values[left] || 0;
      return;
    }

    const middle = Math.floor((left + right) / 2);
    this.build(node * 2, left, middle);
    this.build(node * 2 + 1, middle + 1, right);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }

  queryRange(startIndex, endIndex) {
    this.lastQueryPath.clear();
    if (this.size === 0 || startIndex < 0 || endIndex < 0 || startIndex > endIndex) {
      return 0;
    }

    if (startIndex >= this.size || endIndex >= this.size) {
      return 0;
    }

    return this.query(1, 0, this.size - 1, startIndex, endIndex);
  }

  query(node, left, right, queryLeft, queryRight) {
    if (queryLeft <= left && right <= queryRight) {
      this.lastQueryPath.add(node);
      return this.tree[node];
    }

    if (queryRight < left || right < queryLeft) {
      return 0;
    }

    const middle = Math.floor((left + right) / 2);
    const leftValue = this.query(node * 2, left, middle, queryLeft, queryRight);
    const rightValue = this.query(node * 2 + 1, middle + 1, right, queryLeft, queryRight);
    this.lastQueryPath.add(node);
    return leftValue + rightValue;
  }

  updateValue(index, value) {
    if (index < 0 || index >= this.size) {
      return false;
    }

    this.values[index] = value;
    this.update(1, 0, this.size - 1, index, value);
    return true;
  }

  update(node, left, right, index, value) {
    if (left === right) {
      this.tree[node] = value;
      return;
    }

    const middle = Math.floor((left + right) / 2);
    if (index <= middle) {
      this.update(node * 2, left, middle, index, value);
    } else {
      this.update(node * 2 + 1, middle + 1, right, index, value);
    }

    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }

  getLevels() {
    if (this.size === 0) {
      return [[{ index: 1, value: 0 }]];
    }

    const maxDepth = Math.ceil(Math.log2(this.size)) + 1;
    const levels = Array.from({ length: maxDepth }, () => []);

    for (let nodeIndex = 1; nodeIndex < this.tree.length; nodeIndex += 1) {
      if (this.tree[nodeIndex] === 0) {
        continue;
      }
      const depth = Math.floor(Math.log2(nodeIndex));
      if (depth < levels.length) {
        levels[depth].push({ index: nodeIndex, value: this.tree[nodeIndex] });
      }
    }

    return levels.filter((level) => level.length > 0);
  }
}

class ProductManager {
  constructor(productList) {
    this.products = productList.map((product) => ({
      name: String(product.name).trim(),
      sales: Number(product.sales)
    }));
    this.trie = new Trie();
    this.segmentTree = new SegmentTree(this.products.map((product) => product.sales));
    this.rebuildStructures();
  }

  rebuildStructures() {
    this.trie = new Trie();
    this.products.forEach((product, index) => {
      this.trie.insert(product.name, index, product.name);
      const words = product.name.split(/\s+/).filter(Boolean);
      words.forEach((word) => {
        this.trie.insert(word, index, product.name);
      });
    });

    this.segmentTree = new SegmentTree(this.products.map((product) => Number(product.sales)));
  }

  getTotalProducts() {
    return this.products.length;
  }

  getTotalSales() {
    return this.products.reduce((sum, product) => sum + Number(product.sales), 0);
  }

  getHighestSales() {
    if (!this.products.length) {
      return 0;
    }
    return this.products.reduce((highest, product) => Math.max(highest, Number(product.sales)), 0);
  }

  getMatchingProducts(prefix) {
    const query = prefix.trim();
    if (!query) {
      return [];
    }

    const matches = this.trie.searchPrefix(query);
    return matches
      .map((match) => {
        const product = this.products[match.index];
        if (!product) {
          return null;
        }
        return {
          name: product.name,
          sales: product.sales,
          index: match.index
        };
      })
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  addProduct(productName, salesValue) {
    const name = String(productName).trim();
    if (!name) {
      throw new Error("Please enter a valid product name.");
    }

    const duplicate = this.products.some((product) => product.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      throw new Error("Product already exists.");
    }

    const numericSales = Number(salesValue);
    if (!Number.isFinite(numericSales) || numericSales < 0) {
      throw new Error("Please enter a valid sales value.");
    }

    this.products.push({
      name,
      sales: numericSales
    });
    this.rebuildStructures();
    return this.products[this.products.length - 1];
  }

  deleteProduct(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.products.length) {
      throw new Error("Invalid index.");
    }

    this.products.splice(index, 1);
    this.rebuildStructures();
    return true;
  }

  updateProductSales(index, newSales) {
    if (!Number.isInteger(index) || index < 0 || index >= this.products.length) {
      throw new Error("Invalid index.");
    }

    const numericSales = Number(newSales);
    if (!Number.isFinite(numericSales) || numericSales < 0) {
      throw new Error("Please enter a valid sales value.");
    }

    this.products[index].sales = numericSales;
    this.segmentTree.updateValue(index, numericSales);
    return this.products[index];
  }

  getRangeSales(startIndex, endIndex) {
    if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex)) {
      throw new Error("Please enter a valid range.");
    }

    if (startIndex < 0 || endIndex < 0 || startIndex >= this.products.length || endIndex >= this.products.length) {
      throw new Error("Invalid index.");
    }

    if (startIndex > endIndex) {
      throw new Error("Start index must be less than or equal to end index.");
    }

    const total = this.segmentTree.queryRange(startIndex, endIndex);
    return total;
  }
}

const productManager = new ProductManager(demoProducts);

const ui = {
  searchInput: document.getElementById("searchInput"),
  matchCount: document.getElementById("matchCount"),
  searchResults: document.getElementById("searchResults"),
  startIndex: document.getElementById("startIndex"),
  endIndex: document.getElementById("endIndex"),
  calculateRangeBtn: document.getElementById("calculateRangeBtn"),
  rangeResult: document.getElementById("rangeResult"),
  rangeMessage: document.getElementById("rangeMessage"),
  updateProductSelect: document.getElementById("updateProductSelect"),
  currentSalesValue: document.getElementById("currentSalesValue"),
  newSalesInput: document.getElementById("newSalesInput"),
  updateSalesBtn: document.getElementById("updateSalesBtn"),
  updateMessage: document.getElementById("updateMessage"),
  totalProducts: document.getElementById("totalProducts"),
  totalSales: document.getElementById("totalSales"),
  highestSales: document.getElementById("highestSales"),
  productTableBody: document.getElementById("productTableBody"),
  newProductName: document.getElementById("newProductName"),
  newProductSales: document.getElementById("newProductSales"),
  addProductBtn: document.getElementById("addProductBtn"),
  addMessage: document.getElementById("addMessage"),
  deleteProductSelect: document.getElementById("deleteProductSelect"),
  deleteProductBtn: document.getElementById("deleteProductBtn"),
  deleteMessage: document.getElementById("deleteMessage"),
  trieTree: document.getElementById("trieTree"),
  segmentTree: document.getElementById("segmentTree")
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(value) {
  return Number(value).toLocaleString("en-IN");
}

function setMessage(element, text, type) {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("success", "error");

  if (type) {
    element.classList.add(type);
  }
}

function renderStats() {
  if (ui.totalProducts) {
    ui.totalProducts.textContent = String(productManager.getTotalProducts());
  }

  if (ui.totalSales) {
    ui.totalSales.textContent = formatCurrency(productManager.getTotalSales());
  }

  if (ui.highestSales) {
    ui.highestSales.textContent = formatCurrency(productManager.getHighestSales());
  }
}

function renderSearchResults() {
  const query = ui.searchInput.value.trim();
  if (!query) {
    ui.matchCount.textContent = "Matches Found: 0";
    ui.searchResults.innerHTML = '<div class="empty-state">Enter a product name to search.</div>';
    renderTrieVisualization();
    return;
  }

  const matches = productManager.getMatchingProducts(query);
  ui.matchCount.textContent = `Matches Found: ${matches.length}`;

  if (!matches.length) {
    ui.searchResults.innerHTML = '<div class="empty-state">No products found.</div>';
    renderTrieVisualization();
    return;
  }

  ui.searchResults.innerHTML = matches
    .map(
      (match) => `
        <div class="result-item">
          <div class="result-title">${escapeHtml(match.name)}</div>
          <div class="result-meta">
            <span>Sales: ${match.sales}</span>
            <span>Index: ${match.index}</span>
          </div>
        </div>
      `
    )
    .join("");

  renderTrieVisualization();
}

function renderTable() {
  ui.productTableBody.innerHTML = productManager.products
    .map(
      (product, index) => `
        <tr>
          <td>${index}</td>
          <td>${escapeHtml(product.name)}</td>
          <td>${product.sales}</td>
          <td>
            <button type="button" class="mini-btn" data-index="${index}" data-action="update-row">Update</button>
          </td>
        </tr>
      `
    )
    .join("");
}

function populateProductSelectors() {
  const options = productManager.products
    .map((product, index) => `<option value="${index}">${escapeHtml(product.name)}</option>`)
    .join("");

  ui.updateProductSelect.innerHTML = options;
  ui.deleteProductSelect.innerHTML = options;

  if (!productManager.products.length) {
    ui.currentSalesValue.textContent = "0";
    ui.newSalesInput.value = "0";
    return;
  }

  const selectedIndex = Number(ui.updateProductSelect.value);
  const safeIndex = Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < productManager.products.length
    ? selectedIndex
    : 0;

  ui.updateProductSelect.value = String(safeIndex);
  ui.deleteProductSelect.value = String(safeIndex);
  reflectProductSales();
}

function reflectProductSales() {
  const selectedIndex = Number(ui.updateProductSelect.value);
  if (!productManager.products[selectedIndex]) {
    ui.currentSalesValue.textContent = "0";
    ui.newSalesInput.value = "0";
    return;
  }

  const selectedProduct = productManager.products[selectedIndex];
  ui.currentSalesValue.textContent = String(selectedProduct.sales);
  ui.newSalesInput.value = String(selectedProduct.sales);
}

function renderTrieVisualization() {
  const query = ui.searchInput.value.trim().toLowerCase();
  const root = productManager.trie.root;
  let currentNode = root;
  let activePrefix = "";

  for (const character of query) {
    if (!currentNode.children[character]) {
      break;
    }
    currentNode = currentNode.children[character];
    activePrefix += character;
  }

  const horizontalSpacing = 68;
  const verticalSpacing = 82;
  const margin = 36;
  const nodes = [];
  const edges = [];
  let leafPosition = 0;
  let maxDepth = 0;

  const getVisibleChildren = (node) => {
    const visibleChildren = [];
    const collectChildren = (currentNode, skippedCharacters = "") => {
      const entries = Object.entries(currentNode.children).sort(([left], [right]) => left.localeCompare(right));
      entries.forEach(([character, childNode]) => {
        const pathSegment = skippedCharacters + character;
        if (character === " ") {
          collectChildren(childNode, pathSegment);
        } else {
          visibleChildren.push({ node: childNode, pathSegment });
        }
      });
    };

    collectChildren(node);
    return visibleChildren;
  };

  const layoutNode = (node, prefix, depth, parent) => {
    const childEntries = getVisibleChildren(node);
    const positionedNode = {
      node,
      prefix,
      depth,
      x: 0,
      y: margin + depth * verticalSpacing
    };
    nodes.push(positionedNode);
    maxDepth = Math.max(maxDepth, depth);

    if (parent) {
      edges.push({ parent, child: positionedNode });
    }

    if (childEntries.length === 0) {
      positionedNode.x = margin + leafPosition * horizontalSpacing;
      leafPosition += 1;
      return positionedNode.x;
    }

    const childPositions = childEntries.map(({ node: childNode, pathSegment }) =>
      layoutNode(childNode, prefix + pathSegment, depth + 1, positionedNode)
    );
    positionedNode.x = (childPositions[0] + childPositions[childPositions.length - 1]) / 2;
    return positionedNode.x;
  };

  layoutNode(root, "", 0, null);

  const width = Math.max(180, margin * 2 + Math.max(0, leafPosition - 1) * horizontalSpacing);
  const height = margin * 2 + maxDepth * verticalSpacing + 24;
  const edgeMarkup = edges
    .map(
      ({ parent, child }) =>
        `<line class="trie-edge" x1="${parent.x}" y1="${parent.y + 22}" x2="${child.x}" y2="${child.y - 22}" />`
    )
    .join("");
  const nodeMarkup = nodes
    .map(({ node, prefix, x, y }) => {
      const isActive = prefix !== "" && activePrefix.startsWith(prefix);
      const label = prefix === "" ? "Root" : `${prefix.slice(-1)}${node.isEndOfWord ? "*" : ""}`;
      const nodeClass = isActive ? "trie-svg-node active" : "trie-svg-node";
      const isRoot = prefix === "";
      const countClass = isRoot ? "trie-count root-count" : "trie-count";
      const countY = isRoot ? -31 : 34;
      return `
        <g class="${nodeClass}" transform="translate(${x}, ${y})">
          <circle r="${prefix === "" ? 23 : 19}"></circle>
          <text class="trie-character" text-anchor="middle" dominant-baseline="central">${escapeHtml(label)}</text>
          <text class="${countClass}" text-anchor="middle" y="${countY}">count: ${node.count}</text>
        </g>
      `;
    })
    .join("");

  ui.trieTree.innerHTML = `
    <svg class="trie-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trie shown as a character tree; asterisks mark word endings">
      <g>${edgeMarkup}</g>
      <g>${nodeMarkup}</g>
    </svg>
  `;
}

function renderSegmentTreeVisualization() {
  const levels = productManager.segmentTree.getLevels();
  const maxDepth = Math.max(
    0,
    ...levels.flatMap((level) => level.map((node) => Math.floor(Math.log2(node.index))))
  );
  const columnCount = 2 ** maxDepth;
  const columnWidth = 86;

  ui.segmentTree.innerHTML = levels
    .map(
      (level) => {
        const depth = Math.floor(Math.log2(level[0].index));
        const columnsPerNode = columnCount / (2 ** depth);

        return `
        <div class="segment-level" style="grid-template-columns: repeat(${columnCount}, minmax(0, 1fr)); min-width: max(100%, ${columnCount * columnWidth}px);">
          ${level
            .map(
              (node) => {
                const columnStart = (node.index - (2 ** depth)) * columnsPerNode + 1;
                return `
                <div class="segment-node ${productManager.segmentTree.lastQueryPath.has(node.index) ? "highlight" : ""}" style="grid-column: ${columnStart} / span ${columnsPerNode};">
                  ${node.value}
                </div>
              `;
              }
            )
            .join("")}
        </div>
      `;
      }
    )
    .join("");
}

function renderAll() {
  renderStats();
  renderSearchResults();
  renderTable();
  populateProductSelectors();
  renderTrieVisualization();
  renderSegmentTreeVisualization();
}

ui.searchInput.addEventListener("input", () => {
  renderAll();
});

ui.calculateRangeBtn.addEventListener("click", () => {
  const start = Number(ui.startIndex.value);
  const end = Number(ui.endIndex.value);

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    setMessage(ui.rangeMessage, "Please enter a valid range.", "error");
    ui.rangeResult.textContent = "Total Sales: 0";
    return;
  }

  if (start < 0 || end < 0) {
    setMessage(ui.rangeMessage, "Invalid index.", "error");
    ui.rangeResult.textContent = "Total Sales: 0";
    return;
  }

  if (start > end) {
    setMessage(ui.rangeMessage, "Start index must be less than or equal to end index.", "error");
    ui.rangeResult.textContent = "Total Sales: 0";
    return;
  }

  if (start >= productManager.getTotalProducts() || end >= productManager.getTotalProducts()) {
    setMessage(ui.rangeMessage, "Invalid index.", "error");
    ui.rangeResult.textContent = "Total Sales: 0";
    return;
  }

  try {
    const total = productManager.getRangeSales(start, end);
    ui.rangeResult.textContent = `Total Sales: ${formatCurrency(total)}`;
    setMessage(ui.rangeMessage, `Range query completed for indices ${start} to ${end}.`, "success");
    renderSegmentTreeVisualization();
  } catch (error) {
    setMessage(ui.rangeMessage, error.message, "error");
    ui.rangeResult.textContent = "Total Sales: 0";
  }
});

ui.updateProductSelect.addEventListener("change", () => {
  reflectProductSales();
});

ui.updateSalesBtn.addEventListener("click", () => {
  const selectedIndex = Number(ui.updateProductSelect.value);
  const newSales = Number(ui.newSalesInput.value);

  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= productManager.getTotalProducts()) {
    setMessage(ui.updateMessage, "Invalid index.", "error");
    return;
  }

  if (!Number.isFinite(newSales) || newSales < 0) {
    setMessage(ui.updateMessage, "Please enter a valid sales value.", "error");
    return;
  }

  try {
    productManager.updateProductSales(selectedIndex, newSales);
    setMessage(ui.updateMessage, "✓ Sales updated successfully.", "success");
    renderAll();
  } catch (error) {
    setMessage(ui.updateMessage, error.message, "error");
  }
});

ui.addProductBtn.addEventListener("click", () => {
  const name = ui.newProductName.value.trim();
  const sales = Number(ui.newProductSales.value);

  if (!name) {
    setMessage(ui.addMessage, "Please enter a valid product name.", "error");
    return;
  }

  if (productManager.products.some((product) => product.name.toLowerCase() === name.toLowerCase())) {
    setMessage(ui.addMessage, "Product already exists.", "error");
    return;
  }

  if (!Number.isFinite(sales) || sales < 0) {
    setMessage(ui.addMessage, "Please enter a valid sales value.", "error");
    return;
  }

  try {
    productManager.addProduct(name, sales);
    setMessage(ui.addMessage, "✓ Product added successfully.", "success");
    ui.newProductName.value = "";
    ui.newProductSales.value = "";
    renderAll();
  } catch (error) {
    setMessage(ui.addMessage, error.message, "error");
  }
});

ui.deleteProductBtn.addEventListener("click", () => {
  if (!productManager.products.length) {
    setMessage(ui.deleteMessage, "No products available to delete.", "error");
    return;
  }

  const selectedIndex = Number(ui.deleteProductSelect.value);
  const productName = productManager.products[selectedIndex]?.name || "selected product";

  const shouldDelete = window.confirm(`Are you sure you want to delete ${productName}?`);
  if (!shouldDelete) {
    return;
  }

  try {
    productManager.deleteProduct(selectedIndex);
    setMessage(ui.deleteMessage, "✓ Product deleted successfully.", "success");
    renderAll();
  } catch (error) {
    setMessage(ui.deleteMessage, error.message, "error");
  }
});

ui.productTableBody.addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action='update-row']");
  if (!target) {
    return;
  }

  const index = Number(target.dataset.index);
  ui.updateProductSelect.value = String(index);
  reflectProductSales();
  ui.updateProductSelect.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

function updateVisualizationInfo(tab) {
  const isTrieTab = tab === "trie";
  document.getElementById("trieInfoContent").hidden = !isTrieTab;
  document.getElementById("segmentInfoContent").hidden = isTrieTab;

  const helpButton = document.getElementById("visualizationHelpButton");
  const structureName = isTrieTab ? "Trie" : "Segment Tree";
  helpButton.setAttribute("aria-label", `Show ${structureName} information`);
  helpButton.title = `${structureName} information`;
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach((tabButton) => {
      const isActive = tabButton === button;
      tabButton.classList.toggle("active", isActive);
      tabButton.setAttribute("aria-selected", String(isActive));
    });

    const triePanel = document.getElementById("trieVisualizationPanel");
    const segmentPanel = document.getElementById("segmentVisualizationPanel");
    triePanel.classList.toggle("active", tab === "trie");
    segmentPanel.classList.toggle("active", tab === "segment");
    updateVisualizationInfo(tab);
  });
});

ui.startIndex.value = "1";
ui.endIndex.value = "4";
ui.searchInput.value = "app";
renderAll();
setMessage(ui.rangeMessage, "Range query ready for demonstration.", "success");
setMessage(ui.updateMessage, "", "");
setMessage(ui.addMessage, "", "");
setMessage(ui.deleteMessage, "", "");
