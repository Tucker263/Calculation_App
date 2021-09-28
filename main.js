//MVVM(Model, View, ViewModel)パターン

//---------ModelとViewModelの実装---------
//VueコンストラクタにModelを定義して渡す
//VueインスタンスはViewModelそのもの
var vmCalculator = new Vue({
    el: "#calculator",
    data: {
        express: ""
    },
    computed: {
        displayExpress: function(){
            return this.express.length === 0 ? "0" : this.express;
        }
    },
    methods: {
        calculate: function(){
            if(this.isTailNumber()) return;
            if(this.express.charAt(0) === '-') this.express = "0" + this.express;

            let nums = [];
            let ops = [];
            for(let i = 0; i < this.express.length; i++){
                if(this.isOperator(this.express.charAt(i))){
                    let currOp = this.express.charAt(i);

                    while(ops.length > 0 && this.getPriority(ops[ops.length - 1]) >= this.getPriority(currOp)){
                        this.process(nums, ops.pop());
                    } 

                    ops.push(currOp);
                }else{
                    let number = "";

                    while(i < this.express.length && !this.isOperator(this.express.charAt(i))){
                        number += this.express.charAt(i);
                        i++;
                    }
                    i--;
                    nums.push(Number(number));
                }
            }

            while(ops.length > 0) this.process(nums, ops.pop());

            this.express = String(nums.pop());
            //指数表記が含まれる時、初期状態にリセット
            if(this.express.indexOf("e") !== -1) this.resetExpress();
        },

        calculateExceptBasic: function(op){//calculateFunction
            let number = Number(this.express);
            if(isNaN(number) || this.express.length === 0) return;

            switch(op){
                case '%':
                    number /= 100; break;
                case "+/-":
                    number = number > 0 ? (-number) : Math.abs(number); break;
                case "squared":
                    number = Math.pow(number, 2); break;
                case "cubed":
                    number = Math.pow(number, 3); break;
                case "PowerE":
                    number = Math.exp(number); break;
                case "Power10":
                    number = Math.pow(10, number); break;
                case "x!":
                    number = this.factorialize(number); break;
                case "ln":
                    number = Math.log(number); break;
                case "log10":
                    number = Math.log10(number); break;
                case "sin":
                    number = Math.sin(number * (Math.PI / 180)); break;
                case "cos":
                    number = Math.cos(number * (Math.PI / 180)); break;
                case "tan":
                    number = Math.tan(number * (Math.PI / 180)); break;
                case "asin":
                    number = Math.asin(number) * (180 / Math.PI); break;
                case "acos":
                    number = Math.acos(number) * (180 / Math.PI); break;
                case "atan":
                    number = Math.atan(number) * (180 / Math.PI); break;
                case "sinh":
                    number = Math.sinh(number); break;
                case "cosh":
                    number = Math.cosh(number); break;
                case "tanh":
                    number = Math.tanh(number); break;
            }

            this.express = String(number);
            //指数表記やInfinityが含まれる時、初期状態にリセット
            if(this.express.indexOf("e") !== -1 || isNaN(number) || this.express === "Infinity") this.resetExpress();
        },

        factorialize: function(n){
            if(n < 0 || n % 1 !== 0) return NaN;
            //スタックオーバーフローを考慮して普通のループ
            let res = 1;
            for(let i = n; i > 0; i--) res *= i;

            return res;
        },

        isTailNumber: function(){
            let tailChar = this.express.charAt(this.express.length - 1);
            return isNaN(tailChar);
        },

        isOperator: function(char){
            return char === '+' || char === '-' || char === '×' || char === '÷';
        },

        getPriority: function(op){
            if(op === '+' || op === '-') return 1;
            if(op === '×' || op === '÷') return 2;
            return 0;
        },

        process: function(nums, op){
            let right = nums.pop();
            let left = nums.pop();

            let result = 0;
            switch(op){
                case '+':
                    result = left + right; break;
                case '-':
                    result = left - right; break;
                case '×':
                    result = left * right; break;
                case '÷':
                    result = left / right; break;
            }
            nums.push(result);
        },

        addToExpress: function(char){
            if(!this.canAddToExpress(char)) return;

            this.express = this.isInitExpress() ? char : this.express + char;
        },

        canAddToExpress: function(char){
            //式が初期状態の時
            if(this.isInitExpress()){
                if(this.isOperator(char) && char !== '-') return false;
                else if(char === '.') return false;
                else return true;
            }

            //末尾の文字と比較
            let tailChar = this.express.charAt(this.express.length - 1);
            if(this.isOperator(tailChar) && this.isOperator(char)) return false;
            if(this.isOperator(tailChar) && char === '.') return false;
            if(tailChar === '.' && this.isOperator(char)) return false;
            if(tailChar === '÷' && char === '0') return false;
            
            //末尾の数字と比較
            let nums = this.express.split(/[-|+|×|÷]/);
            let tailNum = nums[nums.length - 1];
            if(tailNum.indexOf(".") !== -1 && char === '.') return false;
            if(tailNum.charAt(0) === "0" && tailNum.indexOf(".") === -1 && !isNaN(char)) return false;
            return true;
        },

        isInitExpress: function(){
            return this.express.length === 0;
        },

        resetExpress: function(){
            this.express = "";
        }
    }
});