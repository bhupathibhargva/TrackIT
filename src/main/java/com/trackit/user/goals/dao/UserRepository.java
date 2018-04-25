package com.trackit.user.goals.dao;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.trackit.user.goals.models.User;

@Repository
public interface UserRepository extends CrudRepository<User, Integer>
{
	List<User> findByUserid(Integer userid);
}
