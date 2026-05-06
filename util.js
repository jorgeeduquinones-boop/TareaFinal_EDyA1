function calcularPedidos(caso) {
    const registros = caso.split(';');
    const resumenClientes = {};

    registros.forEach(reg => {
        const [customer, product, category, price, quantity, timestamp] = reg.trim().split(' ');
        const subtotal = parseFloat(price) * parseInt(quantity);

        if (!resumenClientes[customer]) {
            resumenClientes[customer] = {
                totalSpent: 0,
                categories: {},
                favoriteCategory: ""
            };
        }

        resumenClientes[customer].totalSpent += subtotal;
        
        resumenClientes[customer].categories[category] = (resumenClientes[customer].categories[category] || 0) + 1;
    });

    const listaClientes = Object.keys(resumenClientes).map(name => {
        const c = resumenClientes[name];
        c.favoriteCategory = Object.keys(c.categories).reduce((a, b) => 
            c.categories[a] >= c.categories[b] ? a : b);
        return { name, ...c };
    });

    listaClientes.sort((a, b) => {
        if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
        if (b.favoriteCategory !== a.favoriteCategory) return b.favoriteCategory.localeCompare(a.favoriteCategory);
        return a.name.localeCompare(b.name);
    });

    // 5. Formatear la salida 
    return listaClientes.map((c, i) => `${i + 1}) ${c.name} ${c.totalSpent} ${c.favoriteCategory}`).join('\n');
}