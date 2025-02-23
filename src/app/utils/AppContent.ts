
export const formMessages = {
    missingPower: 'על מנת לשלוח טופס תקין, חובה למלא מודל ואת מספר המודלים',
}

export const sysStrings = {
  email: {
    successMessage: 'Email sent successfully',
    failedMessage: 'Failed to send email: ',
    missingInfo: 'file name or receiver is missing!'
  },
  database: {
    saveFailed: 'Saving data failed!',
  }
}

export const appStrings = {
  email: {
    success: 'המייל נשלח בהצלחה.',
    failed: 'שליחת המייל נכשלה. ודאו שחיבור האינטרנט תקין ונסו שוב.'
  },
  dataSaved: 'הפרטים נשמרו בהצלחה. ',
  dataSavedError: 'לא הצלחנו לשמור את הנתונים. אנא נסו שוב או פנו לתמיכה במידה שהבעיה נמשכת.',
  archive: 'ארכיון',
  clear: 'נקה',
  missigRecords: 'לא נמצאו רשומות מתאימות...',
  attchmentsExists: '..טופס זה כולל תמונות' 
  
}

// todo: change name, maybe formBlocksMap
export const formFieldMap = {
    //inspection
    head:['provider'],
    info:['customer', 'invoice', 'address', 'facillity-ls'],
    test: ['amper', 'kw'],
    convertor: ['cunits', 'cpower', 'convertor-ls', 'cmodel'],
    panel: ['punits', 'ppower', 'panel-ls', 'pmodel'],
    techs: ['electrician-ls', 'elicense', 'ephone', 'eemail','planner-ls', 'plicense', 'pphone', 'pemail'],
    data: ['voltl', 'voltn', 'omega', 'pm', 'rcurrent', 'mcurrent', 'check'],
    //storage
    storage: ['batteries','capacity', 'bmanufacture'],
    //elevator
    elevator: ['elevator', 'mainbreaker', 'mainbreakersize'],
    //charge
    charge: ['station', 'manufacture', 'model', 'power',  'maxcurrent', 'breakersize'],
    end: ['comments', 'message']
}

// FormFeilds
export const fieldsNameMap: any = {
    //inspection
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
    voltl: 'מתח שלוב',
    voltn: 'מתח פאזי',
    rcurrent: 'פחת',
    mcurrent: 'זרם זליגה',
    check: 'תקין',
    omega: 'לולאת תקלה',
    pm: 'שיטת הגנה',
    facillity: 'מתקן',
    comments:'הערות',
    message:'הודעה',
    //storage
    batteries: 'כמות סוללות',
    capacity: 'הספק סוללה',
    bmanufacture: 'שם יצרן',
    //elevator
    elevator: 'מספר מעלית',
    mainbreaker: 'מפסק ראשי',
    mainbreakersize: 'גודל מפסק ראשי',
    //charge
    station: 'מספר עמדה',
    manufacture: 'שם היצרן',
    model: 'דגם',
    power: 'הספק',
    maxcurrent: 'זרם מרבי',
    breakersize: 'גודל המספק',
}

export const facillties = ['מחסן','לול','רפת','גג','תעשייה','מבנה מסחרי','מבנה מגורים'];

export const appDropDwons = ['electrician', 'planner', 'facillity', 'convertor', 'panel'];

