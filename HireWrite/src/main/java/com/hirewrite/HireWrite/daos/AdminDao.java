package com.hirewrite.HireWrite.daos;

import com.hirewrite.HireWrite.entities.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminDao extends JpaRepository<Admin, Integer> {

}
