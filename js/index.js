const db = new Dexie('my_database');
// const XLSX = globalThis.XLSX;
db.version(1).stores({
    menu: '++id,name,price,status,created,dbImg,onlineImg',
    goods: '++id,name,totalPrice,status,created',
    images: 'name,data'
})

const dbUtils = {
    // 添加数据
    add: async function (tableName, data) {
        try {
            const id = await db[tableName].add(data);
            console.log(`Added item with id ${id}`);
            return id;
        } catch (error) {
            console.error("Add failed: ", error);
        }
    },
    // 批量添加
    bulkAdd: async function (tableName, dataArray) {
        try {
            const keys = await db[tableName].bulkAdd(dataArray);
            console.log("Bulk add successful: ", keys);
            return keys;
        } catch (error) {
            console.error("Bulk add failed: ", error);
        }
    },
    // 删除数据
    delete: async function (tableName, id) {
        try {
            await db[tableName].delete(id);
            console.log(`Deleted item with id ${id}`);
        } catch (error) {
            console.error("Delete failed: ", error);
        }
    },
    // 更新数据
    update: async function (tableName, id, updatedData) {
        try {
            const updated = await db[tableName].update(id, updatedData);
            if (updated) {
                console.log(`Updated item with id ${id}`);
            } else {
                console.log(`No item found with id ${id}`);
            }
        } catch (error) {
            console.error("Update failed: ", error);
        }
    },
    // 查询单个
    get: async function (tableName, id) {
        try {
            const item = await db[tableName].get(id);
            return item;
        } catch (error) {
            console.error("Get failed: ", error);
        }
    },
    // 条件查询
    where: async function (tableName, field, value) {
        try {
            const items = await db[tableName].where(field).equals(value).toArray();
            return items;
        } catch (error) {
            console.error("Where failed: ", error);
        }
    },
    // 查询所有
    getAll: async function (tableName) {
        try {
            const items = await db[tableName].toArray();
            return items;
        } catch (error) {
            console.error("Get all failed: ", error);
        }
    },
};

const {createApp} = Vue;
const {ElMessage} = ElementPlus;
const app = createApp({
    data() {
        return {
            dishes: [
                {name: "鱼香肉丝", price: 25},
                {name: "宫保鸡丁", price: 30},
                {name: "麻婆豆腐", price: 20}
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
            valueStatus: 0,
            printInfo: {},
            srcImg: 'blob:http://localhost:63342/b4c31491-b1d2-411f-a946-effc800476e2',
            fileList: [],
            dialogImageUrl: '',
            dialogVisible: false,
            images: [],
            bannerInfo: [
                {
                    img: './img/douhuayu.jpg'
                },
                {
                    img: './img/laziji.jpg'
                },
                {
                    img: './img/koushuiji.jpg'
                },
                {
                    img: './img/mapodoufu.jpg'
                }
            ],
            input4: '',
            keyHe: '2c04e63e94c0443994322e6fbd25abd8',
            keyGa: '49954499e6e4bf49107289308f0ea316',
            weatherInfo: {}
        };
    },
    computed: {
        totalPrice() {
            return this.order.reduce((sum, dish) => parseInt(sum) + parseInt(dish.price), 0);
        }
    },
    methods: {
        queryData() {
            dbUtils.where('goods', 'id', parseInt(this.input4)).then(r => {
                this.goods = r
            })
        },
        handlePreview(file) {
            console.log(file, this.fileList, 777)
        },
        bannerStyle(data) {
            return {
                'background-image': `url(${data.img})`,
                'background-size': 'contain',/* 确保图片完整显示 */
                'background-repeat': 'repeat',/* 平铺图片以填满背景 */
                'background-position': 'center',/* 将图片居中放置（在平铺之前） */
            }
        },
        async uploadFn(data) {
            // console.log(data, 666)
            // this.srcImg = data.url;
            const file = data;
            if (file) {
                // 读取文件为Blob
                const blob = file;
                // 存储到IndexedDB
                await db.images.add({
                    name: file.name,
                    data: blob
                });
            }
        },
        handlePictureCardPreview(uploadFile) {
            console.log(uploadFile);
            this.dialogImageUrl = uploadFile.url;
            this.dialogVisible = true
        },
        scrollTo(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({behavior: "smooth"});
            }
        },
        addToOrder(dish) {
            this.order.push(dish);
        },
        addItme(ku, data, target) {
            db.open().then(() => {
                ElMessage({
                    message: '操作成功!',
                    type: 'success',
                })
                if (data[0].id) {
                    return db[ku].update(data[0].id, data[0]);

                } else {
                    return db[ku].bulkPut(data);
                }

            }).then(() => {
                if (target === 'goods') {
                    return db[ku].where('status').equals(this.valueStatus).limit(10).toArray();
                } else {
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
                this.newDish.created = new Date().toLocaleString('zh-CN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }).replace(/\//g, '-');
                this.addItme('menu', [{...this.newDish}], 'dishes')
                this.newDish.name = "";
                this.newDish.price = null;
                delete this.newDish.id
            } else {
                ElMessage({
                    message: '请填写完整的菜品信息！',
                    type: 'error',
                })
            }
        },
        updateDialog(data) {
            this.newDish = {...data}
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
            this.input4 = ''
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
                created: new Date().toLocaleString('zh-CN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }).replace(/\//g, '-')
            }
            this.order.forEach(element => {
                obj.name += `${element.name}(${element.price}),`
            });
            obj.totalPrice = this.order.reduce((sum, dish) => parseInt(sum) + parseInt(dish.price), 0);
            this.addItme('goods', [{...obj}], 'goods')
            this.order = []
        },
        overOrder(data) {
            data.status = 1
            this.addItme('goods', [{...data}], 'goods')
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
        },
        printText(data) {
            // const printContent = document.getElementById('print-content').innerHTML;
            const newWindow = window.open('', '', 'height=600,width=800');
            newWindow.document.write('<html><head><title>用餐订单</title>');
            newWindow.document.write('</head><body>');
            newWindow.document.write(`<div id="print-content" style="border: 1px solid #000;">
                <p>${data.id}号</p>
                <p>${data.name}</p>
            </div>`);
            newWindow.document.write('</body></html>');
            newWindow.document.close();
            newWindow.print();
        },
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
        getImageData() {
            db.images.toArray().then(res => {
                console.log(res, 999)
                if (res.length !== 0) {

                    this.srcImg = URL.createObjectURL(res[0].data)
                }
            })
        },
        handleRemove(data) {
            console.log(data.name, '删除图片')
            db.images.delete(data.name)
        },
        delOrder(id) {
            dbUtils.delete('menu', id).then((r) => {
                ElMessage({
                    message: '操作成功!',
                    type: 'success',
                })
                this.getMenu()
            })
        },
        // 获取天气
        getWeather() {

            // http://ip-api.com/json/
            axios.get(`https://restapi.amap.com/v3/ip?key=${this.keyGa}`).then(r => {
                const location = r.data.adcode
                axios.get(`https://restapi.amap.com/v3/weather/weatherInfo?city=${location}&key=${this.keyGa}`).then(res => {
                    if(res.data.status === '1'){
                        ElMessage.success({
                            message: '天气获取成功！'
                        })
                        this.weatherInfo = res.data.lives[0]
                    }else{
                        ElMessage.fail({
                            message: '无天气信息！'
                        })
                    }
                })
            })
        }
    },
    mounted() {
        // this.$message({
        //     message: '这是一条消息',
        //     type: 'success'
        // });
        this.getMenu();
        this.getGoods('goods', 'goods');
        this.getWeather();
        // this.getImageData()
    },
}).use(ElementPlus).mount('#app');
// 将 ElMessage 绑定到全局属性
// app.config.globalProperties.$message = ElMessage;
