// {Name: Comcast_Demo_Script}
// {Description: Comcast Demo Script}
// {Visibility: Admin}

const names = ["James", "Michael", "Ramu", "Andrey", "Amritesh", "Cathy", "Jessica"];

recognitionHints("call Ramu", "call Amritesh", "call Cathy", "call Ramu");

intent("(Good morning|Hi|Hello|How are you)", p => {
    p.play("Good morning James! You had 8 hours of restful sleep last night. What would you like to do today?");
});

intent(`call $(N ${names.join(`|`)})`, p => {
    p.play(`Ok, Calling ${p.N}`);
});

intent(`Send $(N ${names.join(`|`)}) a message $(M* .+)`, p => {
    p.play(`OK got it, your message has been sent to ${p.N}`);
});

intent(`What is my health status`, p => {
    p.play("Here's your health status from yesterday: you took 10,112 steps and burned 603 calories " +
        "with 17 minutes of exercise. Your fitness goal today is to burn 300 calories from exercise.");
});

intent("How is the weather today", p => {
    p.play("Today in Boston the weather is sunny and 78 degrees, a great day for a walk. " +
        "Take a 30 minute walk to reach today's fitness goal.");
});



intent("(How do I stay on track|How can I get closer to my goal|How do I stay healthy)", p => {
    p.play("To maintain progress towards your wellness goals, it's recommended " +
        "that you eat a balanced diet of fruits, vegetables, and meats. Avoid sugars and junk food " +
        "and walk at least 10,000 steps.");
});


intent("Who can I $(C call|message)", p => {
    p.play(`You can ${p.C} from your list of contacts ${names.join(", ")}`);
});

intent("(Who is in|Who are|What are) (my|) contacts", p => {
    p.play(`Your contacts are ${names.join(", ")}`);
});

intent("Restart (demo|)", p => {
    p.play("OK, demo restarted");
});

fallback("You can call someone or send a message");