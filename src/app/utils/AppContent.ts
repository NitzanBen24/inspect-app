

export const formMessages = {
    missingPower: 'על מנת לשלוח טופס תקין, חובה למלא מודל ואת מספר המודלים',
}

export const formFieldMap = {
    info:['customer', 'invoice', 'address', 'facillity-ls'],
    test: ['amper', 'kw'],
    convertor: ['cunits', 'cpower', 'convertor-ls', 'cmodel'],
    panel: ['punits', 'ppower', 'panel-ls', 'pmodel'],
    techs: ['electrician-ls', 'elicense', 'ephone', 'eemail','planner-ls', 'plicense', 'pphone', 'pemail'],
    data: ['volt-l', 'volt-n', 'omega', 'pm', 'rcurrent', 'mcurrent', 'check'],
    end: ['comments, message']
}

export const fieldsNameMap: any = {
    customer: 'שם לקוח',
    invoice: 'מספר הזמנה',
    provider: 'ספק עבודה',
    address: 'כתובת',
    kw: 'הספק המטען',
    amper: 'גודל חיבור',
    cunits: 'מספר מהפכים',
    cmodel: 'דגם',
    cpower: 'הספק',
    convertor: 'שם יצרן',
    punits: 'מספר מודלים',
    pmodel: 'מודל',
    panel: 'שם יצרן',
    electrician: 'חשמלאי',
    planner: 'מתכנן',
    'volt-l': 'מתח שלוב',
    'volt-n': 'מתח פאזי',
    rcurrent: 'פחת',
    mcurrent: 'זרם זליגה',
    check: 'תקין',
    omega: 'לולאת תוצאה',
    pm: 'שיטת הגנה',
    facillity: 'מתקן',
}



export const facillties = ['מחסן','לול','רפת','תעשייה','מבנה מסחרי','מבנה מגורים'];