package com.trackit.user.goals.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trackit.user.goals.dao.GoalRepository;
import com.trackit.user.goals.dao.UserRepository;
import com.trackit.user.goals.models.Goal;
import com.trackit.user.goals.models.User;

@RestController
public class TrackITService {
	
	@Autowired 
	GoalRepository goalRepository;
	@Autowired
	UserRepository userRepository;
	
	@GetMapping("/goals")
	public void getGoals(@RequestParam("userid") Integer userid)
	{
		List<Goal> userGoals = new ArrayList<>();
		List<Goal> goals = new ArrayList<>();
		int count = 1;
		
		goals = (List<Goal>) goalRepository.findAll();
		
		for (Goal goal : goals) 
		{
			if(goal.getUser_identifier() == userid)
			{
				userGoals.add(goal);
			}
		}
		System.out.println("User with " + userid + " has following goals");
		for (Goal goal : userGoals) 
		{
			System.out.println();
			System.out.println("Goal: " + count);
			System.out.println("Goal Identifier: " + goal.getId());
			System.out.println("Goal Name: " + goal.getName());
			System.out.println("Goal Type: " + goal.getType());
			count++;
		}
	}

}
