package com.trackit.user.goals.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.trackit.user.goals.controller.TrackITController;
import com.trackit.user.goals.dao.GoalRepository;
import com.trackit.user.goals.models.Goal;

@Service
public class TrackITService {
	
	@Autowired 
	GoalRepository goalRepository;
	
	public String sayHello(String id) {
		System.err.println(goalRepository.count() +" " +goalRepository.findAll() +" " +goalRepository.findByName("wow").get(0).getName());
        return  id;
    } 
	
    public String addGoal(Goal goal) {
		String msg = "";
		System.err.println();
		if(null != goal){
			goalRepository.save(goal);	
		}
		else{
			msg = "please pass the goal object{ name:goal , type:type}";
		}
		
		if(null == goalRepository.findByName(goal.getName()) || goalRepository.findByName(goal.getName()).isEmpty()){
			msg = "goal not added please check the goal details again";
		}
		else{
			msg = goalRepository.findByName(goal.getName()).get(0).getName() + " has been added sucessfully";
		}
		
        return  msg;
    } 
	
	public List<Goal> getGoals(Integer userid)
	{
		List<Goal> userGoals = new ArrayList<>();
		List<Goal> goals = new ArrayList<>();
		
		goals = (List<Goal>) goalRepository.findAll();
		
		for (Goal goal : goals) 
		{
			if(goal.getUser_identifier() == userid)
			{
				userGoals.add(goal);
			}
		}
		
		return userGoals;
	}

}
