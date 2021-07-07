const API = 'https://my-json-server.typicode.com/MaxLebedinsky/JSON_for_E-shop';
const IMAGES_FOLDER = './images/';

class List {
    constructor(url, container, dispatcher = DISPATCHER){
        this.container = container;
        this.dispatcher = dispatcher;
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
    render(){
        const block = document.querySelector(this.container);
        for (let product of this.goods){
            const productObj = new this.dispatcher[this.constructor.name](product);
            // console.log(productObj);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
        if (this.container === '.cart-block-content') {
            console.log('rendering cart');
            this.updateTotal();
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
        constructor(el, photo = 'http://dummyimage.com/150x200'){
        this.product_name = el.product_name;
        this.price = el.price;
        this.id_product = el.id_product;
        this.photo = el.photo;
        this.category = el.category;
        this.brand = el.brand;
    }
    render(){
        return `<div class="product-item" data-id="${this.id_product}">
                <img src="${IMAGES_FOLDER}${this.photo}" alt="${this.product_name}">
                    <p class="category">${this.category}</p>
                    <p class="brand">${this.brand}
                <div class="desc">
                    <h3>${this.product_name}</h3>
                    <div class="item-total">
                        <p class="price">$${this.price}</p>
                        <button class="buy-btn"
                        data-id="${this.id_product}"
                        data-name="${this.product_name}"
                        data-price="${this.price}"
                        data-image="${this.photo}"
                        data-brand="${this.brand}"
                        data-category="${this.category}">В корзину</button>
                    </div>
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
    constructor(container = ".cart-block-content", url = "/cart"){
        super(url, container);
        this.getJson()
            .then(data => {
                this.handleData(data.content);
            });
    }
    addProduct(element){
                    document.querySelector('.cart-empty').classList.add('invisible');
                    document.querySelector('.cart-total').classList.remove('invisible');
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
                            brand: element.dataset['brand'],
                            category: element.dataset['category'],
                            quantity: 1
                        };
                        this.goods = [product];
                        this.render();
                    }
                    this.updateTotal();
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
                    this.updateTotal();
                    // console.log('after decrease: ', this.allProducts);
    }
    deleteProduct(element){
                    let productId = +element.dataset['id'];
                    // console.log('productId: ', productId);
                    let find = this.allProducts.find(product => product.id_product === productId);
                    this.allProducts.splice(this.allProducts.indexOf(find), 1);
                    document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                    if(!this.allProducts.length) {
                        console.log('Cart is empty');
                        document.querySelector('.cart-empty').classList.remove('invisible');
                        document.querySelector('.cart-total').classList.add('invisible');
                    };
                    this.updateTotal();
                    // console.log('after delete: ', this.allProducts);
    }
    _updateCart(product){
       let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
    //    console.log(block);
       block.querySelector('.product-quantity').textContent = `${product.quantity}`;
       block.querySelector('.product-price>span').textContent = `${product.quantity*product.price}`;
    }
    updateTotal() {
        document.querySelector('.cart-total').innerHTML=`Общая стоимость товаров: $<span>${this.calcSum()}</span>`;
    }
    calcSum(){
        return this.allProducts.reduce((accum, item) => accum += item.price * item.quantity, 0);
    }
    _init(){
        document.querySelector('.btn-cart').addEventListener('click', () => {
            document.querySelector('.cart-block').classList.toggle('invisible');
            document.querySelector('.layover').classList.toggle('invisible');
        });
        document.querySelector('.cart-block').addEventListener('click', e => {
            if(e.target.classList.contains('minus-btn')){
                this.decreaseProduct(e.target);
            }
            if(e.target.classList.contains('plus-btn')){
            this.addProduct(e.target);
            console.log(e.target);
            }
            // if(e.target.parentNode.classList.contains('del-btn')){
            //     console.log(e.target.parentNode);
            //     this.deleteProduct(e.target.parentNode);
            // }
            if(e.target.classList.contains('del-btn')){
                console.log(e.target);
                this.deleteProduct(e.target);
            }
            

            if(e.target.classList.contains('btn-close')){
                document.querySelector('.cart-block').classList.toggle('invisible');
                document.querySelector('.layover').classList.toggle('invisible');
            }
        });
        document.querySelector('.layover').addEventListener('click', () => {
            document.querySelector('.cart-block').classList.toggle('invisible');
            document.querySelector('.layover').classList.toggle('invisible');
        })
        // document.querySelector('.cart-total').innerHTML=`Total: ${this.calcSum()}`;
    }

}

class CartItem extends Item{
    // constructor(el, photo = 'http://dummyimage.com/50x75'){
        constructor(el){
        super(el);
        this.quantity = el.quantity;
    }
    render(){
    // return `<div class="cart-item" data-id="${this.id_product}">
    //         <div class="product-bio">
    //         <img src="${IMAGES_FOLDER}${this.photo}" alt="Some image" width="50">
    //         <div class="product-desc">
    //         <p class="product-title">${this.product_name}</p>
    //         <p class="product-quantity">Quantity: ${this.quantity}</p>
    //     <p class="product-single-price">$${this.price} each</p>
    //     </div>
    //     </div>
    //     <div class="right-block">
    //         <p class="product-price">$${this.quantity*this.price}</p>
    //         <button class="minus-btn" data-id="${this.id_product}">-</button>
    //         <button class="plus-btn" data-id="${this.id_product}">+</button>
    //         <button class="del-btn" data-id="${this.id_product}">&times;</button>
    //     </div>
    //     </div>`
    // }
    return `<div class="cart-item" data-id="${this.id_product}">
                
                    <div class="cart-item-img"><img src="${IMAGES_FOLDER}${this.photo}" alt="${this.product_name}"></div>
                    <div class="product-desc">
                        <p><span>${this.category}</span> <span>${this.brand}</span></p>
                        <p class="product-title">${this.product_name}</p>
                    </div>
                    <div class="product-single-price">Цена: $${this.price}</div>
                
                    <div class="right-block">
                        <button class="minus-btn" data-id="${this.id_product}">-</button>
                        <div class="product-quantity"> ${this.quantity} </div>
                        <button class="plus-btn" data-id="${this.id_product}">+</button>
                    </div>

                <div class="product-price">Ст-ть: $<span>${this.quantity*this.price}<span></div>
                <button class="del-btn" data-id="${this.id_product}">&times;</button>
            </div>`
}
}
const DISPATCHER = {
    ProductsList: ProductItem,
    Cart: CartItem
};

let cart = new Cart();
let products = new ProductsList(cart);
// products.getJson(`getProducts.json`).then(data => products.handleData(data));

