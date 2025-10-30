// Sample Data Creator Script
// This script creates realistic sample data for testing the timetable system

import { 
  departmentService, 
  teacherService, 
  subjectService, 
  classService, 
  divisionService, 
  batchService, 
  roomService 
} from './src/services/crudService.js';

const createSampleData = async () => {
  console.log('🚀 Creating sample data for Timetable Manager...');

  try {
    // 1. Create Departments
    console.log('📚 Creating departments...');
    const departments = await Promise.all([
      departmentService.create({
        name: 'Computer Science',
        code: 'CS',
        head_name: 'Dr. Sarah Johnson',
        description: 'Computer Science and Information Technology'
      }),
      departmentService.create({
        name: 'Mathematics',
        code: 'MATH',
        head_name: 'Prof. Michael Smith',
        description: 'Mathematics and Statistics Department'
      }),
      departmentService.create({
        name: 'Science',
        code: 'SCI',
        head_name: 'Dr. Emily Davis',
        description: 'Physics, Chemistry and Biology'
      }),
      departmentService.create({
        name: 'Humanities',
        code: 'HUM',
        head_name: 'Prof. James Wilson',
        description: 'Literature, History and Social Studies'
      })
    ]);
    console.log('✅ Created 4 departments');

    // 2. Create Teachers
    console.log('👨‍🏫 Creating teachers...');
    const teachers = await Promise.all([
      // CS Department
      teacherService.create({
        full_name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@school.edu',
        phone: '+1-555-0101',
        department_id: departments[0].id,
        specialization: 'Computer Science',
        qualification: 'PhD in Computer Science'
      }),
      teacherService.create({
        full_name: 'Prof. David Chen',
        email: 'david.chen@school.edu',
        phone: '+1-555-0102',
        department_id: departments[0].id,
        specialization: 'Software Engineering',
        qualification: 'MS Computer Science'
      }),
      teacherService.create({
        full_name: 'Dr. Lisa Wang',
        email: 'lisa.wang@school.edu',
        phone: '+1-555-0103',
        department_id: departments[0].id,
        specialization: 'Data Science',
        qualification: 'PhD in Data Science'
      }),
      
      // Math Department
      teacherService.create({
        full_name: 'Prof. Michael Smith',
        email: 'michael.smith@school.edu',
        phone: '+1-555-0201',
        department_id: departments[1].id,
        specialization: 'Advanced Mathematics',
        qualification: 'PhD in Mathematics'
      }),
      teacherService.create({
        full_name: 'Dr. Anna Martinez',
        email: 'anna.martinez@school.edu',
        phone: '+1-555-0202',
        department_id: departments[1].id,
        specialization: 'Statistics',
        qualification: 'PhD in Statistics'
      }),
      
      // Science Department
      teacherService.create({
        full_name: 'Dr. Emily Davis',
        email: 'emily.davis@school.edu',
        phone: '+1-555-0301',
        department_id: departments[2].id,
        specialization: 'Physics',
        qualification: 'PhD in Physics'
      }),
      teacherService.create({
        full_name: 'Prof. Robert Brown',
        email: 'robert.brown@school.edu',
        phone: '+1-555-0302',
        department_id: departments[2].id,
        specialization: 'Chemistry',
        qualification: 'MS Chemistry'
      }),
      teacherService.create({
        full_name: 'Dr. Jennifer Lee',
        email: 'jennifer.lee@school.edu',
        phone: '+1-555-0303',
        department_id: departments[2].id,
        specialization: 'Biology',
        qualification: 'PhD in Biology'
      }),
      
      // Humanities Department
      teacherService.create({
        full_name: 'Prof. James Wilson',
        email: 'james.wilson@school.edu',
        phone: '+1-555-0401',
        department_id: departments[3].id,
        specialization: 'Literature',
        qualification: 'MA English Literature'
      }),
      teacherService.create({
        full_name: 'Dr. Maria Garcia',
        email: 'maria.garcia@school.edu',
        phone: '+1-555-0402',
        department_id: departments[3].id,
        specialization: 'History',
        qualification: 'PhD in History'
      })
    ]);
    console.log('✅ Created 10 teachers');

    // 3. Create Subjects
    console.log('📖 Creating subjects...');
    const subjects = await Promise.all([
      // CS Subjects
      subjectService.create({
        name: 'Programming Fundamentals',
        code: 'CS101',
        credits: 4,
        department_id: departments[0].id,
        description: 'Introduction to programming concepts'
      }),
      subjectService.create({
        name: 'Data Structures',
        code: 'CS201',
        credits: 4,
        department_id: departments[0].id,
        description: 'Data structures and algorithms'
      }),
      subjectService.create({
        name: 'Database Systems',
        code: 'CS301',
        credits: 3,
        department_id: departments[0].id,
        description: 'Database design and management'
      }),
      
      // Math Subjects
      subjectService.create({
        name: 'Calculus I',
        code: 'MATH101',
        credits: 4,
        department_id: departments[1].id,
        description: 'Differential and integral calculus'
      }),
      subjectService.create({
        name: 'Linear Algebra',
        code: 'MATH201',
        credits: 3,
        department_id: departments[1].id,
        description: 'Vectors, matrices and linear transformations'
      }),
      subjectService.create({
        name: 'Statistics',
        code: 'MATH301',
        credits: 3,
        department_id: departments[1].id,
        description: 'Probability and statistical analysis'
      }),
      
      // Science Subjects
      subjectService.create({
        name: 'Physics I',
        code: 'PHYS101',
        credits: 4,
        department_id: departments[2].id,
        description: 'Classical mechanics and thermodynamics'
      }),
      subjectService.create({
        name: 'Chemistry I',
        code: 'CHEM101',
        credits: 4,
        department_id: departments[2].id,
        description: 'General chemistry principles'
      }),
      subjectService.create({
        name: 'Biology I',
        code: 'BIO101',
        credits: 4,
        department_id: departments[2].id,
        description: 'Cell biology and genetics'
      }),
      
      // Humanities Subjects
      subjectService.create({
        name: 'English Literature',
        code: 'ENG101',
        credits: 3,
        department_id: departments[3].id,
        description: 'Introduction to English literature'
      }),
      subjectService.create({
        name: 'World History',
        code: 'HIST101',
        credits: 3,
        department_id: departments[3].id,
        description: 'Survey of world history'
      })
    ]);
    console.log('✅ Created 11 subjects');

    // 4. Create Rooms
    console.log('🏫 Creating rooms...');
    const rooms = await Promise.all([
      // CS Labs
      roomService.create({
        room_number: 'CS-LAB-101',
        type: 'laboratory',
        capacity: 30,
        floor: 1,
        department_id: departments[0].id
      }),
      roomService.create({
        room_number: 'CS-LAB-102',
        type: 'laboratory',
        capacity: 30,
        floor: 1,
        department_id: departments[0].id
      }),
      
      // Regular Classrooms
      roomService.create({
        room_number: 'ROOM-201',
        type: 'classroom',
        capacity: 40,
        floor: 2,
        department_id: departments[1].id
      }),
      roomService.create({
        room_number: 'ROOM-202',
        type: 'classroom',
        capacity: 40,
        floor: 2,
        department_id: departments[1].id
      }),
      roomService.create({
        room_number: 'ROOM-203',
        type: 'classroom',
        capacity: 35,
        floor: 2,
        department_id: departments[2].id
      }),
      
      // Science Labs
      roomService.create({
        room_number: 'SCI-LAB-301',
        type: 'laboratory',
        capacity: 25,
        floor: 3,
        department_id: departments[2].id
      }),
      roomService.create({
        room_number: 'SCI-LAB-302',
        type: 'laboratory',
        capacity: 25,
        floor: 3,
        department_id: departments[2].id
      }),
      
      // Lecture Halls
      roomService.create({
        room_number: 'LH-401',
        type: 'lecture_hall',
        capacity: 100,
        floor: 4,
        department_id: departments[3].id
      }),
      roomService.create({
        room_number: 'LH-402',
        type: 'lecture_hall',
        capacity: 80,
        floor: 4,
        department_id: departments[3].id
      })
    ]);
    console.log('✅ Created 9 rooms');

    // 5. Create Classes
    console.log('🎓 Creating classes...');
    const classes = await Promise.all([
      classService.create({
        name: 'Computer Science - Year 1',
        code: 'CS-Y1',
        number_of_divisions: 2,
        department_id: departments[0].id,
        academic_year: '2024-25'
      }),
      classService.create({
        name: 'Computer Science - Year 2',
        code: 'CS-Y2',
        number_of_divisions: 2,
        department_id: departments[0].id,
        academic_year: '2024-25'
      }),
      classService.create({
        name: 'Mathematics - Year 1',
        code: 'MATH-Y1',
        number_of_divisions: 1,
        department_id: departments[1].id,
        academic_year: '2024-25'
      }),
      classService.create({
        name: 'General Science - Year 1',
        code: 'SCI-Y1',
        number_of_divisions: 2,
        department_id: departments[2].id,
        academic_year: '2024-25'
      })
    ]);
    console.log('✅ Created 4 classes');

    // 6. Create Divisions
    console.log('📝 Creating divisions...');
    const divisions = [];
    for (const cls of classes) {
      for (let i = 1; i <= cls.number_of_divisions; i++) {
        const division = await divisionService.create({
          name: `Division ${String.fromCharCode(64 + i)}`, // A, B, C...
          class_id: cls.id,
          student_count: Math.floor(Math.random() * 15) + 25 // 25-40 students
        });
        divisions.push(division);
      }
    }
    console.log(`✅ Created ${divisions.length} divisions`);

    // 7. Create Batches
    console.log('👥 Creating batches...');
    const batches = [];
    for (const division of divisions) {
      // Create 2-3 batches per division for lab work
      const numBatches = Math.floor(Math.random() * 2) + 2; // 2-3 batches
      for (let i = 1; i <= numBatches; i++) {
        const batch = await batchService.create({
          number: i,
          division_id: division.id,
          student_count: Math.floor(division.student_count / numBatches)
        });
        batches.push(batch);
      }
    }
    console.log(`✅ Created ${batches.length} batches`);

    console.log('\n🎉 Sample data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${departments.length} Departments`);
    console.log(`- ${teachers.length} Teachers`);
    console.log(`- ${subjects.length} Subjects`);
    console.log(`- ${rooms.length} Rooms`);
    console.log(`- ${classes.length} Classes`);
    console.log(`- ${divisions.length} Divisions`);
    console.log(`- ${batches.length} Batches`);
    
    console.log('\n✨ Now you can:');
    console.log('1. Go to the Timetables page');
    console.log('2. Click "Generate Timetable"');
    console.log('3. Select a class and generate your first timetable');
    console.log('4. Use the "View" button to see the schedule grid!');

    return {
      departments,
      teachers,
      subjects,
      rooms,
      classes,
      divisions,
      batches
    };

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
};

// Export for use
export { createSampleData };

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleData()
    .then(() => {
      console.log('✅ Sample data creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to create sample data:', error);
      process.exit(1);
    });
}
