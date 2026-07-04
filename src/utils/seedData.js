export function seedData() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const formatDate = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

  const seedTransactions = [];

  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    if (month < 0) { month += 12; year--; }
    seedTransactions.push({
      id: crypto.randomUUID(),
      type: 'income',
      amount: parseFloat(rand(1800, 2200)),
      category: 'Stipendio',
      date: formatDate(year, month, 27),
      note: 'Stipendio mensile'
    });
  }

  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    if (month < 0) { month += 12; year--; }
    seedTransactions.push({
      id: crypto.randomUUID(),
      type: 'expense',
      amount: 750,
      category: 'Casa',
      date: formatDate(year, month, 1),
      note: 'Affitto'
    });
  }

  const expenseCategories = ['Cibo', 'Trasporti', 'Casa', 'Salute', 'Intrattenimento', 'Altro'];
  const incomeCategories = ['Freelance', 'Regalo', 'Investimenti', 'Altro'];

  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    if (month < 0) { month += 12; year--; }

    const numExpenses = Math.floor(rand(15, 25));
    for (let j = 0; j < numExpenses; j++) {
      const day = Math.floor(rand(1, 28));
      const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      let amount;
      if (cat === 'Cibo') amount = parseFloat(rand(5, 80));
      else if (cat === 'Trasporti') amount = parseFloat(rand(10, 100));
      else if (cat === 'Casa') amount = parseFloat(rand(20, 200));
      else if (cat === 'Salute') amount = parseFloat(rand(15, 150));
      else if (cat === 'Intrattenimento') amount = parseFloat(rand(10, 120));
      else amount = parseFloat(rand(5, 250));

      seedTransactions.push({
        id: crypto.randomUUID(),
        type: 'expense',
        amount,
        category: cat,
        date: formatDate(year, month, day),
        note: ''
      });
    }

    const numIncomes = Math.floor(rand(2, 5));
    for (let j = 0; j < numIncomes; j++) {
      const day = Math.floor(rand(1, 28));
      const cat = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
      let amount;
      if (cat === 'Freelance') amount = parseFloat(rand(100, 600));
      else if (cat === 'Regalo') amount = parseFloat(rand(20, 150));
      else if (cat === 'Investimenti') amount = parseFloat(rand(50, 300));
      else amount = parseFloat(rand(10, 200));

      seedTransactions.push({
        id: crypto.randomUUID(),
        type: 'income',
        amount,
        category: cat,
        date: formatDate(year, month, day),
        note: ''
      });
    }
  }

  localStorage.setItem('finance_transactions', JSON.stringify(seedTransactions));
  window.location.reload();
}