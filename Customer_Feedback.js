// {Name: Customer_Feedback}
// {Description: Feedback Playground}
// {Visibility: Admin}

title(`Feedback Playground`);

function submitGForm(p) {
    let jsp = {
        url: "https://docs.google.com/forms/d/e/1FAIpQLSef6UNithPQxTnrYXf7StUfeIx_2X8t0oijmTp2x3EghhPYRw/formResponse?entry.170643555=" + encodeURI(p.state.answers[0].a) + "&entry.1024357467=" + encodeURI(p.state.answers[1].r) + "&entry.885198741=" + encodeURI(p.state.answers[1].f) + "&entry.546360890=" + encodeURI(p.state.answers[2].a) + "&entry.817834467=" + encodeURI(p.state.answers[3].a) + "&entry.1160077760=" + encodeURI(p.state.answers[4].a) + "&submit=Submit",
        method: 'GET',
        timeout: 3000,
    };

    api.request(jsp, (err, res, body) => {
        if (err) {
            console.log(err);
            return;
        }
        if (!res) {
            console.log('No response');
            return;
        }
        if (res.statusCode != 200) {
            console.log('Received status code: ' + res.statusCode);
            return;
        }
    });
}

intent(`test form`, p=>{
    submitGForm(p);
    p.play(`sent form`);
})

let discreteSentiments = [[`very unlikely`, `super unlikely`, `extremely unlikely`, `massively unlikely`],
    [`unlikely`, `poor chance`, `not likely`],
    [`neutral`,`ambivalent`,`maybe`,`don't know`, `not sure`],
    [`very likely`,`super likely`, `extremely likely`, `massively likely`],
    [`likely`, `probably`, `it's good`, `most likely`, `pretty likely`, `somewhat likely`]];

let dsi = _.flatten(_.map(discreteSentiments, s => _.map(s, e => `${e}~${s[0]}`))).join('|')

const cmdPage = {embeddedPage: true, page: "survey.html"}

let openEndQuestion = context(() => {
    follow(`(I think|It is|I feel|It's|I am) $(I* (.+))`, p => {
        p.resolve({cmd: 'ok', res: {answer: p.I.value}});
    });
    navigation();
});
let oneToTenQuestion = context(() => {
    follow(`(I would rate it|Rating|it's|) $(NUMBER) (because|since|as|) $(I* (.*))`, p => {
        if(p.NUMBER.number < 1 || p.NUMBER.number > 10) {
             p.play(`(Sorry|Try again), your rating must be (a number|) between one and ten.`);
        } else {
             p.resolve({cmd: 'ok', res: {rating: p.NUMBER.number, answer: `Rating <b>${p.NUMBER}</b> and feedback <i>"${p.I}"</i>`, feedback: p.I.value}});
        }
    });
    follow(`(I would rate it|Rating|it's|) $(NUMBER)`, p => {
         if(p.NUMBER.value < 1 || p.NUMBER.value > 10) {
                p.play(`(Sorry|Try again), your rating must be (a number|) between one and ten.`);
         } else {
                p.resolve({cmd: 'ok', res: {rating: p.NUMBER.value, answer: `Rating <b>${p.NUMBER}</b>`}});
         }
    });
    fallback(`(To rate your experience,|) (Please say a number between 1 and 10)`)
    navigation();
});

let durationQuestion = context(() => {    
    follow(`$(NUMBER) $(T year|day|month|week|years|days|months|weeks)`, p => {
        p.resolve({cmd: 'ok', res: {answer: `${p.NUMBER} ${p.T}`}});
    });
    follow(`$(A couple|few|many|barely|a long time|not so long|several) (of|any|) $(T year|day|month|week|years|days|months|weeks|)`, p => {
        p.resolve({cmd: 'ok', res: {answer: `${p.A} ${p.T}`}});
    });
    navigation();
});

let likelihoodQuestion = context(() => {
    follow(`(It's|I find it|It is|I am|I feel|I think|) $(T~${dsi}) (because|since|as|) $(I* (.*)) `, p => {
        if (p.I.length) {
            p.resolve({cmd: 'ok', res: {answer: `<b>${p.T.label}</b> - <i>${p.I}</i>`}});
        } else {
            p.resolve({cmd: 'ok', res: {answer: `<b>${p.T}</b>`}});
        }
    });
    follow(`(It's|I find it|It is|I am|I feel|I think|) $(T~${dsi})`, p => {
        p.resolve({cmd: 'ok', res: {answer: `<b>${p.T.label}</b>`}});
    });
    navigation();
    let hint = _.map(discreteSentiments, s=>s[0]).join(', ');
    fallback(`(Sorry, didn't recognize that.|) (To rate your experience,|) just say any of the following (descriptors|). ${hint}.`)
});

function navigation() {
    follow("(please|) (repeat|start over|again) (the question|)", p => p.play(p.q));
    follow("(Stop|Exit|End|Never Mind|Leave|Terminate|Quit) (survey|)", p => p.resolve({cmd: 'exit'}));
    follow("(Please|) (go to|open|return to|) (the|) (previous|previous question|before|go back|back)", p => p.resolve({cmd: 'back'})); 
    follow("(Please|) (go forward|skip|skip question|skip this question|next|next question|pass|I don't know)", p => p.resolve({cmd: 'skip'}));
    follow("(go to|open|return to|) (the|) $(ORDINAL) (question|item)", p=> p.resolve({cmd: 'goto', res: p.ORDINAL.number}));
    follow("(go to|open|return to|) (question|item) $(NUMBER)", p=> p.resolve({cmd: 'goto', res: p.NUMBER.number}));
    follow("(go to|open|return to|) (the|) last (question|item)", p=> p.resolve({cmd: 'goto', res: -1}));
    follow("How many questions are in (this|the|) survey", p=> p.resolve({cmd: 'numQ'}));
    follow("How many questions are left (in this survey|in the survey|)", p=> p.resolve({cmd: 'numQleft'}));
}

project.questions = [
    {q:'Overall, how satisfied are you with Alan and why?', 
     t: openEndQuestion},
    {q: 'How would you rate the quality of Alan from 1 to 10, and why?',
     t: oneToTenQuestion},
    {q: 'If you could, what would you improve about Alan?',
     t:openEndQuestion},
    {q: 'How long have you been using Alan?', 
     t: durationQuestion},
    {q: 'Please give us any suggestions, comments, concerns, or additional feedback.',
     t: openEndQuestion,
    },
];

intent(`(Show me|) what can I do here?`, `How does this app work?`, p => {
    p.play(`In this survey, we ask a series of questions about your experience with Alan. 
            To begin, say Start Survey.`);
});

intent(`(Start|Commence|Begin|Take|) (survey|)`, async p => {
    p.play({embeddedPage:true, page: "survey.html", cmd: 'reset'});
    p.play(`Hi there! Thanks for using Alan. We’d like to ask you a few questions about your experience so far.`);
    p.play({embeddedPage: true, page: "survey.html", cmd: 'endMessage', display: false});
    let index = 0;
    p.state.answers = [];
    while(index < project.questions.length) {
        p.state.answers[index] = {};
        p.state.answers[index].a = '';
        p.state.answers[index].r = '';
        p.state.answers[index].f = '';
        index++;
    }
    index = 0;
    while(index < project.questions.length) {
        let q = project.questions[index];
        p.play({embeddedPage:true, page: "survey.html", cmd: 'showQuestion', questionIndex: index, question: q.q, hints: q.h});
        p.play(q.q);
        let {cmd, res} = await p.then(q.t, {q: q.q, index});
        if (cmd === 'back') {
            if (index > 0) {
                p.play(`(Going|Returning) to previous question.`);
                index -= 1;
                continue;
            } else {    
                p.play(`You are on the first question of the survey.`);
                continue;
            }            
        } else if (cmd == 'goto') {
            if(res == -1){
                p.play(`(ok|) going to last question`);
                index = project.questions.length -1;
                continue;
            }
              if(res < project.questions.length){
                p.play(`(ok|) going to question ${res} `);
                index = res -1;
                continue;                
            }else{
                p.play(`No such questions exists`);
                continue;
            }
        } else if (cmd == 'skip') {
            if (index < project.questions.length - 1) {
                p.play({embeddedPage:true, page: "survey.html", cmd: 'skip', questionIndex: index});
                p.play(`(Skipping|Next|New) question`);
                index++;
                continue;
            } else {
                p.play(`there are no more questions`);
                break;
            }
        } else if (cmd == 'exit') {
            p.play({embeddedPage:true, page: "survey.html", cmd: 'reset'});
            p.play("Exiting the survey.")
            return;
        } else if (cmd == 'numQ') {
            p.play(`There are ${project.questions.length} questions in this survey`);
        } else if (cmd == 'numQleft') {
            p.play(`There are ${project.questions.length - index -1} questions left`);
        } else {
            if(!res.rating){
                p.state.answers[index].a = res.answer;
            } else {
                p.state.answers[index].r = res.rating;
                if(res.feedback){
                    p.state.answers[index].f = res.feedback;
                }
            }
            p.play({embeddedPage:true, page: "survey.html", cmd: 'showAnswer', questionIndex: index, answer: res.answer});
            p.play(`(Okay|Sure|Great), Thanks for your (feedback|response).`)
        }
        index++;
    }
    submitGForm(p);
    p.play({embeddedPage: true, page: "survey.html", cmd: 'endMessage', display: true, index: -1});
    p.play('Survey is complete! Thanks for submitting.');
});

intent(`Thanks Alan`,
      reply(`You're welcome`));

//projectAPI.greet = (p, param, callback) => {
//    p.play("Hi, thanks for using Alan. To (get started|), say '(Begin|Start|Take) Survey'.");
//};
