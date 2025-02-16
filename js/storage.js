// Módulo para gerenciar o armazenamento local (localStorage)
export class Storage {
    // Transações
    static getTransactions() {
      return JSON.parse(localStorage.getItem('transactions')) || [];
    }
  
    static addTransaction(transaction) {
      const transactions = Storage.getTransactions();
      transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  
    static deleteTransaction(index) {
      const transactions = Storage.getTransactions();
      transactions.splice(index, 1);
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  
    // Investimentos
    static getInvestments() {
      return JSON.parse(localStorage.getItem('investments')) || [];
    }
  
    static addInvestment(investment) {
      const investments = Storage.getInvestments();
      investments.push(investment);
      localStorage.setItem('investments', JSON.stringify(investments));
    }
  
    static deleteInvestment(index) {
      const investments = Storage.getInvestments();
      investments.splice(index, 1);
      localStorage.setItem('investments', JSON.stringify(investments));
    }
  
    // Metas
    static getGoals() {
      return JSON.parse(localStorage.getItem('goals')) || [];
    }
  
    static addGoal(goal) {
      const goals = Storage.getGoals();
      goals.push(goal);
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  
    static deleteGoal(index) {
      const goals = Storage.getGoals();
      goals.splice(index, 1);
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }
  