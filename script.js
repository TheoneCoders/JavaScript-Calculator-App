var calculator = (function(){

    let maxLimit = 25;
    let inputValue = '';
    let screenElement;
    let historyElement;
    let historyPreserved = false;
    const allowedOperation = ['+', '-', '*', '%', '÷'];
    let negativeValue = false;

    function clear() {
        historyElement.innerText = 'Ans = 0';
        inputValue = '';
        screenElement.innerText = 0;
    }

    function deleteLast() {
        if(inputValue.length > 1) {
            inputValue = inputValue.slice(0, -1); 
            screenElement.innerText = inputValue;
        }
    }

    function appendNumber(number) {

        if(inputValue.length >= maxLimit) {
            return;
        }

        //recalculation on result case
        if(historyPreserved) {
            if(allowedOperation.indexOf(number) === -1) {
                inputValue = '';
            }
            historyPreserved = false;
        }

        if(allowedOperation.indexOf(number) > -1) {
            let last =  inputValue.length > 0 ? inputValue.charAt(inputValue.length - 1) : '';
            if((last == '' && !negativeValue) || (allowedOperation.indexOf(last) > -1 && last == number)) {
                return;
            } else if(allowedOperation.indexOf(last) > -1 && !negativeValue) {
                deleteLast();
            } else if(last === '.') {
                inputValue += '0';
            }
        } 

        //handle decimal case
        if(number == '.' && inputValue.length > 0) {
            const decimalValidity = checkDecimalValidation();
            if(!decimalValidity) {
                return;
            }
        }

        inputValue += number;
        screenElement.innerText = inputValue;
    }


    function compute() {

        const calculationData = parseInputValue();
        if(calculationData.length) {
            const result = calculate(calculationData);

            //check for Error
            if(typeof result !== 'number') {
                screenElement.innerText = 'ERROR';
                inputValue = '';
            } else {
                screenElement.innerText = result;
                historyElement.innerText = inputValue + '='
                inputValue = result.toString();
                historyPreserved = true;
            }
        }
    }

    function parseInputValue() {
       
        const data = [];
        let number = '';
        for (const character of inputValue) {
            if (allowedOperation.indexOf(character) > -1) {
                if (number === '' && character === '-') {
                    number = '-';
                } else {
                    data.push(parseFloat(number), character);
                    number = '';
                }
            } else {
                number += character;
            }
        }

        if (number !== '') {
            data.push(parseFloat(number));
        } else {
            //check for last number
            const lastNumber = inputValue[inputValue.length -1];
            if(allowedOperation.indexOf(lastNumber) > -1 || lastNumber === '.') {
                return [];
            }
        }
        return data;
    }
    
    function calculate(calculationData) {

        //operator Precedence
        const operatorPrecedenceArray = [
                   {
                       '*': (a, b) => a * b, 
                       '÷': (a, b) => a / b, 
                       '%': (a, b) => { return (a / 100) * b}
                    },
                   {
                       '+': (a, b) => a + b, 
                       '-': (a, b) => a - b
                    }
                ];
        
        let operator;
        for (const operators of operatorPrecedenceArray) {
            const newCalData = [];

            //do calculation
            for (const token of calculationData) {
                if (token in operators) {
                    operator = operators[token];
                } else if (operator) {

                    const result =  operator(newCalData[newCalData.length - 1], token);
                    const maxDecimal = countDecimals(newCalData[newCalData.length - 1]) > countDecimals(token) 
                        ? countDecimals(newCalData[newCalData.length - 1])
                        : countDecimals(token);

                    newCalData[newCalData.length - 1] = parseFloat(result.toFixed(maxDecimal));
                    operator = null;
                } else {
                    newCalData.push(token);
                }
            }
            calculationData = newCalData;
        }

        if (calculationData.length > 1) {
            return calculationData;
        } else {
            return calculationData[0];
        }
    }

    function countDecimals (value) {
        if (Math.floor(value.valueOf()) === value.valueOf()) return 0;
    
        var str = value.toString();
        if (str.indexOf(".") !== -1 && str.indexOf("-") !== -1) {
            return str.split("-")[1] || 0;
        } else if (str.indexOf(".") !== -1) {
            return str.split(".")[1].length || 0;
        }
        return str.split("-")[1] || 0;
    }

    function checkDecimalValidation() {
        let index = inputValue.length - 1;
        while(index >= 0 && allowedOperation.indexOf(inputValue[index]) === -1) {
            if(inputValue[index] === '.' ) {
                return false;
            }
            index--;
        }

        return true;
    }
    
    return {
        init: function() {

            //fetching element
            const numberButtons = document.querySelectorAll('.number')
            const operationButtons = document.querySelectorAll('.operation')
            const equalsButton = document.querySelector('.result')
            const deleteButton = document.querySelector('.del-operation')
            const allClearButton = document.querySelector('.all-clear')
            const negativeOperation = document.querySelector('.n-operation');

            //screen elements
            screenElement = document.querySelector('#current-ops');
            historyElement = document.querySelector('#history-tag');

            //attaching event handlers
            numberButtons.forEach(button => {
                button.addEventListener('click', () => {
                    appendNumber(button.innerText)
                })
            })
            
            operationButtons.forEach(button => {
                button.addEventListener('click', () => {
                    appendNumber(button.innerText)
                })
            })

            equalsButton.addEventListener('click', () => {
                compute();
            })

            allClearButton.addEventListener('click', () => {
                clear();
            })

            deleteButton.addEventListener('click', () => {
                deleteLast();
            })

            negativeOperation.addEventListener('click', () => {
                negativeValue = true;
                appendNumber('-');
                negativeValue = false;
            })
        }
    }
})()

calculator.init();