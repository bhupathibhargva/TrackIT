package com.trackit.user.goals.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trackit.user.goals.dao.GoalRepository;
import com.trackit.user.goals.models.Goal;
import com.trackit.user.goals.service.TrackITService;

@RestController
public class TrackITController{
    

	/*@Autowired 
	GoalRepository repository;*/
	@Autowired
	TrackITService service;
	
	@GetMapping("/hello")
    public String hello(@RequestParam("id") String id) 
	{
		return  service.sayHello(id);
    } 
	
	@PostMapping("/add")
    public String addGoal(@RequestBody Goal goal) 
	{
        return  service.addGoal(goal);
    } 
	
	@GetMapping("/goals")
	public List<Goal> goals(@RequestParam("userid") Integer userid)
	{		
		return service.getGoals(userid);
	}
}