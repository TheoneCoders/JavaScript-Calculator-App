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
            if(last == '' || (allowedOperation.indexOf(last) > -1 && last == number)) {
                return;
            } else if(allowedOperation.indexOf(last) > -1 && !negativeValue) {
                deleteLast();
            } else if(last === '.') {
                inputValue += '0';
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

        //check for last number
        if(allowedOperation.indexOf(number) > -1 || number === '.') {
            return [];
        }

        if (number !== '') {
            data.push(parseFloat(number));
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
                    newCalData[newCalData.length - 1] = 
                        operator(newCalData[newCalData.length - 1], token);
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