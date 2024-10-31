const db = new Dexie('my_database');
// const XLSX = globalThis.XLSX;




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
            goods: [],
            newDish: {
                name: "",
                price: null,
                status: true
            },
            dialogFormVisible: false,
            form: {
                name: '',
                region: '',
                date1: '',
                date2: '',
                delivery: false,
                type: [],
                resource: '',
                desc: '',
            },
            count: 0,
            isLogin: false,
            options: [
                {
                    value: 'all',
                    label: '全部订单',
                },
                {
                    value: 0,
                    label: '烹饪中',
                },
                {
                    value: 1,
                    label: '已完成',
                },
            ],
            valueStatus: 0
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
                if (data[0].id) {
                    return db[ku].update(data[0].id, data[0]);

                } else {
                    return db[ku].bulkPut(data);
                }
            }).then(() => {
                if(target === 'goods'){
                    return db[ku].where('status').equals(this.valueStatus).limit(10).toArray();
                }else{
                    return db[ku].reverse().toArray();
                }
            }).then(res => {
                this[target] = [...res]
                
                if (data[0].id) {
                    this.dialogFormVisible = false
                }
            })
        },
        queryFn(ku, status) {
            db.open().then(() => {
                if (status) {
                    return db[ku].where('status').equals(status).toArray();
                } else {
                    return db[ku].toArray();
                }
            }).then(res => {
                console.log(res, 7777)
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
                this.newDish.created = new Date();
                this.addItme('menu', [{ ...this.newDish }], 'dishes')
                this.newDish.name = "";
                this.newDish.price = null;
                delete this.newDish.id
            } else {
                this.$message.error("请填写完整的菜品信息！");
            }
        },
        updateDialog(data) {
            this.newDish = { ...data }
            this.dialogFormVisible = true
        },
        getMenu(ku = 'menu', target = 'dishes') {
            db.open().then(() => {
                return db[ku].reverse().toArray();
            })
                .then((res) => {
                    this[target] = res
                })
                .catch((err) => {
                    console.log(err)
                });
        },
        getGoods(ku = 'menu', target = 'dishes',) {

            db.open().then(() => {
                if (this.valueStatus !== 'all') {
                    return db[ku].where('status').equals(this.valueStatus).limit(10).toArray();
                } else {
                    return db[ku].toArray();
                }
            })
                .then((res) => {
                    this[target] = res
                })
                .catch((err) => {
                    console.log(err)
                });
        },
        sureOrder() {
            const obj = {
                name: '',
                totalPrice: 0,
                status: 0,
                created: new Date()
            }
            this.order.forEach(element => {
                obj.name += `${element.name}(${element.price}),`
            });
            obj.totalPrice = this.order.reduce((sum, dish) => parseInt(sum) + parseInt(dish.price), 0);
            this.addItme('goods', [{ ...obj }], 'goods')
            this.order = []
        },
        overOrder(data) {
            data.status = 1
            this.addItme('goods', [{ ...data }], 'goods')
        },
        loginManage() {
            this.count++
            if (this.count === 5) {
                this.isLogin = true
                this.count = 0
            }
        },
        exportToExcel(data, fileName = "data.xlsx") {
            const d = JSON.parse(JSON.stringify(data))
            // 1. 创建工作簿
            const wb = XLSX.utils.book_new();

            const modifiedData = d.map(item => ({
                "用户ID": item.id,    // 中文表头
                "菜品名称": item.name,    // 中文表头
                "总价": item.totalPrice,      // 中文表头
                "订餐时间": item.created,     // 中文表头,      // 中文表头
                "状态": item.status      // 中文表头
            }));

            // 2. 将对象数组转换为工作表
            const ws = XLSX.utils.json_to_sheet(modifiedData);

            // 3. 将工作表添加到工作簿
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            // 4. 生成并下载Excel文件
            XLSX.writeFile(wb, fileName);
        }
        // updateDish(ku,data,target){
        //     db.open().then(() => {
        //         return db[ku].update(data.id,data);
        //     }).then(() => {
        //         return db[ku].toArray();
        //     }).then(res => {
        //         this[target] = [...res]
        //         console.log(this[target], 9988)
        //     })
        // }
    },
    mounted() {
        db.version(1).stores({
            menu: '++id,name,price,status,created',
            goods: '++id,name,totalPrice,status,created'
        })
        this.getMenu()
        this.getGoods('goods', 'goods')

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