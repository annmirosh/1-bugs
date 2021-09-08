// {Name: EatStreetFAQ}
// {Description: EatStreet FAQ}
// {Visibility: Admin}

project.eatStreetData.forEach(qa=> {
    qa.questions.forEach(q=> {
        intent(q, reply(qa.answer));
    });
});
