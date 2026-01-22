package com.hirewrite.HireWrite.services;

import com.hirewrite.HireWrite.daos.AdminDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
public class AdminServiceImpl {
    @Autowired
    private AdminDao adminDao;

}
