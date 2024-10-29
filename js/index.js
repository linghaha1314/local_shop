const db = new Dexie('my_database');





const { createApp } = Vue;

createApp({
    data() {
        return {
            dishes: [
                { name: "鱼香肉丝", price: 25 },
                { name: "宫保鸡丁", price: 30 },
                { name: "麻婆豆腐", price: 20 }
            ],
            order: [],
            newDish: {
                name: "",
                price: null
            }
        };
    },
    computed: {
        totalPrice() {
            return this.order.reduce((sum, dish) => parseInt(sum) + parseInt(dish.price), 0);
        }
    },
    methods: {
        scrollTo(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        },
        addToOrder(dish) {
            this.order.push(dish);
        },
        addItme(ku, data, target) {
            db.open().then(() => {
                return db[ku].bulkPut(data);
            }).then(() => {
                return db[ku].toArray();
            }).then(res => {
                this[target] = [...res]
                console.log(this[target], 9988)
            })
        },
        removeFromOrder(dish) {
            const index = this.order.indexOf(dish);
            if (index > -1) {
                this.order.splice(index, 1);
            }
        },
        uploadDish() {
            if (this.newDish.name && this.newDish.price) {

                // this.dishes.push({ ...this.newDish });
                this.addItme('menu', [{ ...this.newDish }], 'dishes')
                console.log(this.dishes, 9988)
                this.newDish.name = "";
                this.newDish.price = null;
            } else {
                this.$message.error("请填写完整的菜品信息！");
            }
        }
    },
    mounted() {
        db.version(1).stores({
            menu: '++id,name,price'
        })
        db.open().then(() => {
            return db.menu.toArray();
        })
            .then((res) => {
                this.dishes = res
                console.log(this.dishes, 999)
            })
            .catch((err) => {
                console.log(err)
            });

        // db.open().then(function () {

        //     this.dishes = db.menu
        //     .where('price')
        //     .between(40, 65)
        //     .toArray();
        //     // return db.menu.add({ name: "鱼香肉丝", price: 42 });

        // }).then(function () {

        //     return db.menu
        //         .where('price')
        //         .between(40, 65)
        //         .toArray();

        // }).then(function (menu) {

        //     console.log(menu, 8888)

        // }).then(function () {
        //     return db.delete(); // So you can experiment again and again...
        // }).catch(Dexie.MissingAPIError, function (e) {
        //     console.log("Couldn't find indexedDB API");
        // }).catch('SecurityError', function (e) {
        //     console.log("SeurityError - This browser doesn't like fiddling with indexedDB.");
        //     console.log("If using Safari, this is because jsfiddle runs its samples within an iframe");
        //     console.log("Go run some samples instead at: https://github.com/dfahlander/Dexie.js/wiki/Samples");
        // }).catch(function (e) {
        //     console.log(e);
        // });
    },
}).use(ElementPlus).mount('#app');