// {Name: Calatena}1
// {Description: Calatena order script}
// {Visibility: Admin}

title("Calatena")

recognitionHints("create a Scaffolding ticket",
    "I help scaffolding",
    "class A", "class C", "class D", "class E", "class F",
    "(A|C|D|E|F)",
    "moving scaffolding", "moving",
    "submit");

const classesMap = {
    "A": "008",
    "C": "024",
    "D": "048",
    "E": "060",
    "F": "999",
};

const flags = {
    "ladder": ["_ciExtraLadder", "Extra Ladder"],
    "ladders": ["_ciExtraLadder", "Extra Ladder"],
    "hazard": ["_ciExHazard", "Explosion Hazard"],
    "hazards": ["_ciExHazard", "Explosion Hazard"],
    "space": ["_ciNarrow", "Narrow Space"],
    "spaces": ["_ciNarrow", "Narrow Space"],
}

intent(`add $(W scaffold)`, p => {
    p.state.workflow = p.W.value;
    p.play({command: 'add', 'workflow': p.W.value});
});

intent("(How do|Can) I create a Scaffolding ticket?",
    "(I|) (need|) help (with a|) Scaffolding (ticket|)", p => {
        p.play("(To create a Scaffolding ticket,|) you must input the dimensions, class, type, load, and details. To start, say Create a Scaffolding ticket, and you will be guided through the required steps.");
    });

intent("(Create|Add|Make|) (a|) Scaffolding ticket", p => {
    // send command to js handler on web page
    p.play({command: "add_ticket", type: "scaffolding"});
    p.play("(Creating|Adding) a Scaffolding ticket. (What are the dimensions?|Let's start with the dimensions.)");
});

// set dimensions fields (Height, Width and Length).
// For ex. say `three by four by five`
intent("$(NUMBER) by $(NUMBER) by $(NUMBER)", p => {
    if (p.NUMBERs.length !== 3) {
        p.play("Your dimension entry was invalid. To add Dimensions, you can say for example 10 by 4 by 3. What are the Dimensions?");
        return;
    }
    let vol = p.NUMBERs[0].number * p.NUMBERs[1].number * p.NUMBERs[2].number;
    let classVal = '';
    if(vol <= 8) {
        classVal = 'A';
    } else if (vol > 16 && vol <= 24) { //Check if there is a B class vol > 8 vol <= 16
        classVal = 'C';
    } else if (vol > 24 && vol <= 48) {
        classVal = 'D';
    } else if (vol > 48 && vol <= 60) {
        classVal = 'E';
    } else {
        classVal = 'F';
    }
    addFields(p, "ClassOfScaffold", "Height", "Length", "Width");
    p.play({
        command: "fill",
        field: ["ClassOfScaffold", "Height", "Length", "Width"],
        value: [classesMap[classVal], p.NUMBERs.map(f => f.number)]
    });
    p.play(`Your total scaffolding is ${vol} meters cubed, so it is a Class ${classVal} Scaffold. ` +
        `Dimensions ${p.NUMBERs[0]} by ${p.NUMBERs[1]} by ${p.NUMBERs[2]} and Class ${classVal} added.`);
    prompt(p)
});

// set class field
// For ex. say `class C` or just `D`
intent("(Class|) $(CLASS A|C|D|E|F)", "(Class|) $(CLASS* [A-Za-z])", p => {
    let classType = p.CLASS.value.toUpperCase();
    // check if client selected one of available classes (this is optional check since intent will not match for other class types)
    if (!['A', 'C', 'D', 'E', 'F'].includes(classType)) {
        p.play("Your Class entry was invalid. Valid Class types are A , C , D , E , or F. What is the Class?");
        return;
    }
    addFields(p, "ClassOfScaffold");
    p.play({
        command: "fill",
        field: ["ClassOfScaffold"],
        value: [classesMap[classType]]
    });
    p.play(`Class ${classType} added.`);
    prompt(p)
});

// set type for Scaffolding ticket
// For ex. say `type facade` or just `moving`
intent("(Type|) $(TYPE Work|Bracket|Facade|Moving|Overhead) (Scaffolding|) (type|)", p => {
    // check if type is in predefined
    if (!['work', 'bracket', 'facade', 'moving', 'overhead'].includes(p.TYPE.value.toLowerCase())) {
        p.play("Your entry for Scaffolding Type was invalid. Valid Scaffolding Types are Work, Baracket, Facade, Moving, or Overhead. What is the Scaffolding Type?");
        return;
    }
    // add type to list of fields which was set by voice
    addFields(p, "TypeOfScaffold");
    // send command to web client
    p.play({
        command: "fill",
        field: ["TypeOfScaffold"],
        value: [p.TYPE.value[0].toUpperCase()]
    });
    // voice response to client
    p.play(`${p.TYPE.value} Scaffolding type added.`);
    prompt(p)
});

// set load class for Scaffolding ticket
// For ex. say `load class point seven five` or `three point zero`
// intent user input for `one point five`, `three point zero` format
intent("(load class|) $(NUMBER) point $(NUMBER) $(NUMBER) (kilo Newton meters|K N M|) (squared|)",
    "(load class|) (point|) $(NUMBER) (kilo Newton meters|K N M|) (squared|)",
    "(load class|) (point|) $(NUMBER) $(NUMBER) (kilo Newton meters|K N M|) (squared|)",   p => {
        let val = 0;
        switch (p.NUMBERs[0].number) {
            case 0:
                val = '075';
                break;
            case 0.75:
                val = '075';
                break;
            case 75:
                val = '075';
                break;
            case 1:
                val = '150';
                break;
            case 1.5:
                val = '150';
                break;
            case 3:
                val = '300';
                break;
            case 4:
                val = '450';
                break;
            case 4.5:
                val = '450';
                break;
            case 6:
                val = '600';
                break;
            case 7:
                val = '075';
                break;
            default :
                p.play("Your entry for Load Class was invalid. Valid Load Classes are zero point seventy five, one point five, three, four point five, or six. What is the Load Class?");
                return;
        }
        addFields(p, "Load");
        p.play({
            command: "fill",
            field: ["Load"],
            value: [val]
        });
        p.play(`Load Class ${val[0] + "," + val[1] + val[2]} kilo Newton meters squared added.`);
        prompt(p)
    });

// get answer for submit request
let submit = context(() => {
    follow("(Yes|Submit|Done|Affirmative|Confirm)", p => {
        p.play({command: "submit", button: "1000"});
        p.play("Your ticket has been submitted");
        p.resolve(null);
    });

    follow("No", p => {
        p.play("(Okay|) what details would you like to add? You can add hazards, narrow spaces, or request additional ladders.");
        p.resolve(null);
    });
});

// command to submit a Scaffolding ticket form
intent("Submit", p => {
    // voice response
    p.play("Review your Scaffolding ticket details. Would you like to Submit?");
    // send command for filled fields highlighting on web page
    p.play({command: 'highlight_fields', fields: p.state.fields});
    // enter context for waiting answer to submit question
    p.then(submit);
});

// no more details answer for `Are there any additional details?`
intent("No (more|) (details|)", "Nothing (more|else)", "(No|) (I'm|) (Done|Finished|Ready) (to submit|)", p => {
    p.play("Review your Scaffolding ticket details. Would you like to Submit?");
    // send command for highlighting of filled fields on web page
    p.play({command: 'highlight_fields', fields: p.state.fields});
    p.then(submit);
});

// set flag for extra ladder
intent("(Add|Also|With|) (extra|additional|added|another|one more|) ladder (also|)", p => {
    addFields(p, "_ciExtraLadder");
    p.play({
        command: "fill",
        field: ["_ciExtraLadder"],
        value: [true]
    });
    p.play("Extra Ladder added.");
    prompt(p)
});

// set flag for explosion hazards
intent("(With|Add|Also|) (explosion|) (hazard|hazards) (also|)", p => {
    addFields(p, "_ciExHazard");
    p.play({
        command: "fill",
        field: ["_ciExHazard"],
        value: [true]
    });
    p.play("Explosion Hazard added.");
    prompt(p)
});

// set flag for narrow spaces
intent("(With|Add|Also|) (narrow|) (space|spaces) (also|)", p => {
    addFields(p, "_ciNarrow");
    p.play({
        command: "fill",
        field: ["_ciNarrow"],
        value: [true]
    });
    // ask if user is ready to submit form
    p.play("Narrow space added.");
    // send command for highlighting of filled fields on web page
    p.play({command: 'highlight_fields', fields: p.state.fields});
    prompt(p)
});

// uncheck flag for extra ladder
intent("(Without|remove) (extra|additional|added|another|one more|) ladder", p => {
    removeFields(p, "_ciExtraLadder");
    p.play({
        command: "fill",
        field: ["_ciExtraLadder"],
        value: [false]
    });
    p.play("Extra Ladder removed.");
    prompt(p)
});

// uncheck flag for explosion hazards
intent("(Without|remove) (explosion|) (hazard|hazards)", p => {
    removeFields(p, "_ciExHazard");
    p.play({
        command: "fill",
        field: ["_ciExHazard"],
        value: [false]
    });
    p.play("Explosion Hazard removed.");
    prompt(p)
});

// uncheck flag for narrow spaces
intent("(Without|remove) (narrow|) (space|spaces)", p => {
    removeFields(p, "_ciNarrow");
    p.play({
        command: "fill",
        field: ["_ciNarrow"],
        value: [false]
    });
    p.play("Narrow space removed.");
    prompt(p)
});

// a note for a user what field should be set next
intent("What (do|) I do now?", "Where was I?", "(What's|) next?", "Continue", "(What|Anything) else?", p => {
    prompt(p, true)
});

const FLAGs = '$(FLAG ladder_|space_|hazard_)';
// Add Details Compounds
intent(`(Add|Also|With|) (extra|additional|added|another|one more|) (explosion|) (narrow|) ${FLAGs} (also|)`,
    `(Add|Also|With|) (extra|additional|added|another|one more|) (explosion|) (narrow|) ${FLAGs} ${FLAGs} (also|)`,
    `(Add|Also|With|) (extra|additional|added|another|one more|) (explosion|) (narrow|) ${FLAGs} ${FLAGs} ${FLAGs} (also|)`, p => {
        processFlags(p, true);
        prompt(p);
    });

// Remove Details Compounds
intent(`(Remove|Without) (extra|additional|added|another|one more|) (explosion|) (narrow|) ${FLAGs} (also|)`,
    `(Remove|Without) (extra|additional|added|another|one more|) (explosion|) (narrow|) ${FLAGs} ${FLAGs} (also|)`,
    `(Remove|Without) (extra|additional|added|another|one more|) (explosion|) (narrow|) ${FLAGs} ${FLAGs} ${FLAGs} (also|)`, p => {
        processFlags(p, false);
        prompt(p);
    });

// 25
intent("(Dimensions|Measurements|Units|) $(NUMBER) by $(NUMBER) by $(NUMBER) (and|with|also|) (Class|) $(CLASS A|C|D|E|F|) (and|with|also|) $(FLAG ladder_|space_|hazard_)", p => {
    let flagKey = p.FLAG.value.toLowerCase();
    let flagField = flags[flagKey][0];
    addFields(p, "Height", "Length", "Width", "ClassOfScaffold", flagField);
    p.play({
        command: "fill",
        field: ["Height", "Length", "Width", "ClassOfScaffold", flagField],
        value: [p.NUMBERs[0].number, p.NUMBERs[1].number, p.NUMBERs[2].number, classesMap[p.CLASS.value], true]
    });
    p.play(`Dimensions ${p.NUMBERs[0].number} by ${p.NUMBERs[1].number} by ${p.NUMBERs[2].number} added. Class ${p.CLASS} added. ${flags[flagKey][1]} also added.`);
    prompt(p)
});

function prompt(p, cont) {
    let say;
    if (!p.state.fields || !p.state.fields.includes('Height')) {
        say = cont ? "To continue say the dimensions of scaffolding." : "";
        say += "What are the dimensions?";
    } else if (!p.state.fields.includes('ClassOfScaffold')) {
        say = cont ? "To continue say class of scaffolding." : "";
        say += "What is the class of the scaffolding?";
    } else if (!p.state.fields.includes('TypeOfScaffold')) {
        say = cont ? "To continue say type of scaffolding." : "";
        say += "What is the type of the scaffolding?";
    } else if (!p.state.fields.includes('Load')) {
        say = cont ? "To continue say the load class of scaffolding." : "";
        say += "What is the load class?";
    } else if (!_.intersection(["_ciExtraLadder", "_ciExHazard", "_ciNarrow"], p.state.fields).length) {
        say = "You can add hazards, narrow spaces, or request additional ladders. Or say Submit, to submit your ticket";
    }
    if (!_.isEmpty(say)) {
        p.play(say);
    } else {
        say = "To continue, say Submit, to submit your ticket, or specify additional details you'd like to add.";
        p.play(say);
        p.then(submit)
    }
}

// function to add field to list of filled fields
function addFields(p, ...fields) {
    if (!p.state.fields) {
        p.state.fields = [...fields]
    } else {
        fields.filter(f => !p.state.fields.includes(f)).forEach(f => p.state.fields.push(f));
    }
}

// function to remove a flag from fields list when flag is unchecked
function removeFields(p, ...fields) {
    if (!p.state.fields) {
        return
    } else {
        fields.forEach(f => {
            let index = p.state.fields.indexOf(f);
            if (index > -1) {
                p.state.fields.splice(index, 1);
            }
        });
    }
}

function processFlags(p, isAdd) {
    let fieldNames = p.FLAGs.map(f => flags[f.toLowerCase()][0]);
    let fieldTexts = p.FLAGs.map(f => flags[f.toLowerCase()][1]);
    if (isAdd) addFields(p, fieldNames)
    else   removeFields(p, fieldNames);
    p.play({
        command: "fill",
        field: fieldNames,
        value: new Array(p.FLAGs.length).fill(isAdd)
    });
    p.play(`${fieldTexts.join(", ")} ${isAdd? 'added':'removed'}.`);
}
