// BUMABLE Product Management - Production Version

class ProductManager {
    constructor() {
        // Check for updated products in localStorage first
        const storedProducts = localStorage.getItem('bumable_products');
        if (storedProducts) {
            try {
                this.products = JSON.parse(storedProducts);
            } catch (e) {
                this.products = this.getThe12Products();
            }
        } else {
            this.products = this.getThe12Products();
        }
    }

    getThe12Products() {
        return [
            {id:'bumable-brief-cheery-red',name:'Bumable Brief – Cheery Red',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-1.jpg',category:'briefs',description:'Classic Bumable brief in cheery red',inStock:true,stockCount:50,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-olive',name:'Bumable Brief – Olive',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-2.jpg',category:'briefs',description:'Classic Bumable brief in olive',inStock:true,stockCount:45,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-lt-grey',name:'Bumable Brief – Lt Grey',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-1.jpg',category:'briefs',description:'Classic Bumable brief in light grey',inStock:true,stockCount:55,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-navy',name:'Bumable Brief – Navy',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-2.jpg',category:'briefs',description:'Classic Bumable brief in navy',inStock:true,stockCount:40,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-black',name:'Bumable Brief – Black',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-1.jpg',category:'briefs',description:'Classic Bumable brief in black',inStock:true,stockCount:60,availableSizes:['S','M','L','XL','XXL']},
            {id:'tie-and-dye-brief',name:'Tie and Dye Brief',regularPrice:599,salePrice:249,onSale:true,image:'../images/products/tie-dye/tie-dye-1-main.jpg',category:'tie-dye',description:'Vibrant tie-dye brief with unique patterns',inStock:true,stockCount:30,availableSizes:['S','M','L','XL','XXL']},
            {id:'tie-and-dye-trunks',name:'Tie and Dye Trunks',regularPrice:599,salePrice:249,onSale:true,image:'../images/products/tie-dye/tie-dye-2-main.jpg',category:'tie-dye',description:'Colorful tie-dye trunks with artistic designs',inStock:true,stockCount:25,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-navy',name:'Solid Trunks – Frozen Navy',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-navy-main.jpg',category:'trunks',description:'Solid navy trunks',inStock:true,stockCount:35,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-grey',name:'Solid Trunks – Frozen Grey',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-2-main.jpg',category:'trunks',description:'Solid grey trunks',inStock:true,stockCount:42,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-black',name:'Solid Trunks – Frozen Black',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-3-main.jpg',category:'trunks',description:'Solid black trunks',inStock:true,stockCount:38,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-green',name:'Solid Trunks – Frozen Green',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-4-main.jpg',category:'trunks',description:'Solid green trunks',inStock:true,stockCount:33,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-burgundy',name:'Solid Trunks – Frozen Burgundy',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-5-main.jpg',category:'trunks',description:'Solid burgundy trunks',inStock:true,stockCount:29,availableSizes:['S','M','L','XL','XXL']}
        ];
    }

    getAllProducts() { return this.products; }
    getProduct(id) { return this.products.find(p => p.id === id); }
    getProductsByCategory(category) { return this.products.filter(p => p.category === category); }
    
    getCurrentPrice(product) {
        return product.salePrice || product.regularPrice;
    }
    
    getDiscountPercentage(product) {
        if (!product.onSale || !product.salePrice) return 0;
        return Math.round((1 - product.salePrice / product.regularPrice) * 100);
    }
    
    updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = {...this.products[index], ...updates};
            this.saveToStorage();
            return true;
        }
        return false;
    }

    saveToStorage() {
        try {
            localStorage.setItem('bumable_products', JSON.stringify(this.products));
        } catch (e) {
            // Silent fail for storage issues
        }
    }

    resetToDefaults() {
        this.products = this.getThe12Products();
        localStorage.removeItem('bumable_products');
    }
}

// Initialize product manager when script loads
if (typeof window !== 'undefined') {
    if (localStorage.getItem('bumable_products')) {
        // Load from admin updates
    } else {
        // Use defaults
    }
    
    // Initialize ProductManager globally
    window.ProductManager = ProductManager;
    window.productManager = new ProductManager();
}