package com.trackit.user.goals.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trackit.user.goals.dao.GoalRepository;
import com.trackit.user.goals.models.Goal;

@RestController
public class TrackITController{


	  @Autowired
	  GoalRepository repository;

	// produces text/plain so the echoed id can never be interpreted as HTML
	@GetMapping(value = "/hello", produces = MediaType.TEXT_PLAIN_VALUE)
    public String sayHello(@RequestParam("id") String id) {
        return id;
    }

	@PostMapping(value = "/add", produces = MediaType.TEXT_PLAIN_VALUE)
    public String addGoal(@RequestBody Goal goal) {
		if (goal == null || goal.getName() == null || goal.getName().isBlank()) {
			return "please pass the goal object{ name:goal , type:type }";
		}

		repository.save(goal);

		if (repository.findByName(goal.getName()).isEmpty()) {
			return "goal not added please check the goal details again";
		}
		return goal.getName() + " has been added sucessfully";
    }
}
