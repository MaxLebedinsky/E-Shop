const API = 'https://my-json-server.typicode.com/MaxLebedinsky/JSON_for_E-shop';
const IMAGES_FOLDER = './images/';

class List {
    constructor(url, container, list = list2){
        this.container = container;
        this.list = list;
        this.url = url;
        this.goods = [];
        this.allProducts = [];
        this.filtered = [];
        this._init();
    }
    getJson(url){
        return fetch(url ? url : `${API + this.url}`)
            .then(result => result.json())
            .catch(error => {
                console.log(error);
            })
    }
    handleData(data){
        this.goods = [...data];
        this.render();
    }
    calcSum(){
        return this.allProducts.reduce((accum, item) => accum += item.price, 0);
    }
    render(){
        const block = document.querySelector(this.container);
        for (let product of this.goods){
            const productObj = new this.list[this.constructor.name](product);
            // console.log(productObj);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }
    filter(value){
        const regexp = new RegExp(value, 'i');
        this.filtered = this.allProducts.filter(product => regexp.test(product.product_name));
        this.allProducts.forEach(el => {
            const block = document.querySelector(`.product-item[data-id="${el.id_product}"]`);
            if(!this.filtered.includes(el)){
                block.classList.add('invisible');
            } else {
                block.classList.remove('invisible');
            }
        })
    }
    _init(){
        return false
    }
}

class Item{
    
    // constructor(el, img = 'http://dummyimage.com/150x200'){
        constructor(el, photo = 'libtech-snowboard.jpg'){
        this.product_name = el.product_name;
        this.price = el.price;
        this.id_product = el.id_product;
        this.photo = el.photo;
    }
    render(){
        return `<div class="product-item" data-id="${this.id_product}">
                <img src="${IMAGES_FOLDER}${this.photo}" alt="Some img">
                <div class="desc">
                    <h3>${this.product_name}</h3>
                    <p>$${this.price}</p>
                    <button class="buy-btn"
                    data-id="${this.id_product}"
                    data-name="${this.product_name}"
                    data-price="${this.price}"
                    data-image="${this.photo}">Купить</button>
                </div>
            </div>`
    }
}

class ProductsList extends List{
    constructor(cart, container = '.products', url = "/goods"){
        super(url, container);
        this.cart = cart;
        this.getJson()
            .then(data => this.handleData(data));
    }
    _init(){
        document.querySelector(this.container).addEventListener('click', e => {
            if(e.target.classList.contains('buy-btn')){
                this.cart.addProduct(e.target);
            }
        });
        document.querySelector('.search-form').addEventListener('submit', e => {
            e.preventDefault();
            this.filter(document.querySelector('.search-field').value)
        })
    }
}


class ProductItem extends Item{}

class Cart extends List{
    constructor(container = ".cart-block", url = "/cart"){
        super(url, container);
        this.getJson()
            .then(data => {
                this.handleData(data.content);
            });
    }
    addProduct(element){
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.id_product === productId);
                    if(find){
                        find.quantity++;
                        // console.log('find: ', find);
                        this._updateCart(find);
                    } else {
                        let product = {
                            id_product: productId,
                            price: +element.dataset['price'],
                            product_name: element.dataset['name'],
                            photo: element.dataset['image'],
                            quantity: 1
                        };
                        this.goods = [product];
                        this.render();
                    }
                    // console.log('after add: ', this.allProducts);
    }
    decreaseProduct(element){
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.id_product === productId);
                    if(find.quantity > 1){
                        find.quantity--;
                        this._updateCart(find);
                    } else {
                        // this.allProducts.splice(this.allProducts.indexOf(find), 1);
                        // document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                        // if(!this.allProducts.length) {console.log('Cart is empty')};
                        this.deleteProduct(element);
                    }
                    // console.log('after decrease: ', this.allProducts);
    }
    deleteProduct(element){
                    let productId = +element.dataset['id'];
                    // console.log('productId: ', productId);
                    let find = this.allProducts.find(product => product.id_product === productId);
                    this.allProducts.splice(this.allProducts.indexOf(find), 1);
                    document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                    if(!this.allProducts.length) {console.log('Cart is empty')};
                    // console.log('after delete: ', this.allProducts);
    }
    _updateCart(product){
       let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
    //    console.log(block);
       block.querySelector('.product-quantity').textContent = `Quantity: ${product.quantity}`;
       block.querySelector('.product-price').textContent = `$${product.quantity*product.price}`;
    }
    _init(){
        document.querySelector('.btn-cart').addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible');
        });
        document.querySelector(this.container).addEventListener('click', e => {
           if(e.target.classList.contains('minus-btn')){
               this.decreaseProduct(e.target);
           }
        });
        document.querySelector(this.container).addEventListener('click', e => {
            if(e.target.classList.contains('plus-btn')){
                this.addProduct(e.target);
            }
        });
        document.querySelector(this.container).addEventListener('click', e => {
            if(e.target.classList.contains('del-btn')){
                this.deleteProduct(e.target);
            }
        });
    }

}

class CartItem extends Item{
    // constructor(el, photo = 'http://dummyimage.com/50x75'){
        constructor(el){
        super(el);
        this.quantity = el.quantity;
    }
    render(){
    return `<div class="cart-item" data-id="${this.id_product}">
            <div class="product-bio">
            <img src="${IMAGES_FOLDER}${this.photo}" alt="Some image" width="50">
            <div class="product-desc">
            <p class="product-title">${this.product_name}</p>
            <p class="product-quantity">Quantity: ${this.quantity}</p>
        <p class="product-single-price">$${this.price} each</p>
        </div>
        </div>
        <div class="right-block">
            <p class="product-price">$${this.quantity*this.price}</p>
            <button class="minus-btn" data-id="${this.id_product}">-</button>
            <button class="plus-btn" data-id="${this.id_product}">+</button>
            <button class="del-btn" data-id="${this.id_product}">&times;</button>
        </div>
        </div>`
    }
}
const list2 = {
    ProductsList: ProductItem,
    Cart: CartItem
};

let cart = new Cart();
let products = new ProductsList(cart);
// products.getJson(`getProducts.json`).then(data => products.handleData(data));

