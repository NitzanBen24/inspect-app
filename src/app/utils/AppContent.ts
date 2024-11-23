import { FormField } from "../utils/types";


export const formMessages = {
    missingPower: 'על מנת לשלוח טופס תקין, חובה למלא מודל ואת מספר המודלים',
}

export const formFieldMap = {
    head:['provider'],
    info:['customer', 'invoice', 'address', 'facillity-ls'],
    test: ['amper', 'kw'],
    convertor: ['cunits', 'cpower', 'convertor-ls', 'cmodel'],
    panel: ['punits', 'ppower', 'panel-ls', 'pmodel'],
    techs: ['electrician-ls', 'elicense', 'ephone', 'eemail','planner-ls', 'plicense', 'pphone', 'pemail'],
    data: ['volt-l', 'volt-n', 'omega', 'pm', 'rcurrent', 'mcurrent', 'check'],
    end: ['comments', 'message']
}

export const fieldsNameMap: any = {
    customer: 'שם לקוח',
    invoice: 'מספר הזמנה',
    provider: 'ספק עבודה',
    address: 'כתובת',
    kw: 'הספק הממיר',
    amper: 'גודל חיבור',
    cunits: 'מספר מהפכים',
    cmodel: 'דגם',
    cpower: 'הספק כללי',
    convertor: 'שם יצרן',
    punits: 'מספר מודלים',
    pmodel: 'הספק פאנל',
    panel: 'שם יצרן',
    electrician: 'חשמלאי',
    planner: 'מתכנן',
    'volt-l': 'מתח שלוב',
    'volt-n': 'מתח פאזי',
    rcurrent: 'פחת',
    mcurrent: 'זרם זליגה',
    check: 'תקין',
    omega: 'לולאת תקלה',
    pm: 'שיטת הגנה',
    facillity: 'מתקן',
    comments:'הערות',
    message:'הודעה',
}

export const extraFields : FormField[] = [
    {
        name: 'providers-ls',
        type: 'TextField',
        require: true,
    },
    {
        name: 'new-providers',
        type: 'TextField',
        require: true,
    },
    {
        name: 'comments',
        type: 'TextField',
        require: true,
    },
    {
        name: 'message',
        type: 'TextField',
        require: true,
    },
    {
        name: 'reciver',
        type: 'TextField',
        require: true,
    },
    {
        name: 'status',
        type: 'TextField',
        require: true,
    }
]


export const facillties = ['מחסן','לול','רפת','גג','תעשייה','מבנה מסחרי','מבנה מגורים'];