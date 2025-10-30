import React, { useState } from 'react';
import { 
  departmentService, 
  teacherService, 
  subjectService, 
  classService, 
  divisionService, 
  batchService, 
  roomService 
} from '../services/crudService';
import { toast } from 'react-toastify';
import Button from './ui/Button';
import { SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';

const SampleDataCreator = ({ onDataCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState('');

  const updateProgress = (message) => {
    setProgress(message);
    console.log(message);
  };

  const createSampleData = async () => {
    setIsCreating(true);
    setProgress('🚀 Starting sample data creation...');

    try {
      // 1. Create Departments
      updateProgress('📚 Creating departments...');
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
      updateProgress('✅ Created 4 departments');

      // 2. Create Teachers
      updateProgress('👨‍🏫 Creating teachers...');
      const teachers = await Promise.all([
        // CS Department Teachers
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
        
        // Math Department Teachers
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
        
        // Science Department Teachers
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
        
        // Humanities Department Teachers
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
      updateProgress('✅ Created 10 teachers');

      // 3. Create Subjects
      updateProgress('📖 Creating subjects...');
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
      updateProgress('✅ Created 11 subjects');

      // 4. Create Rooms
      updateProgress('🏫 Creating rooms...');
      const rooms = await Promise.all([
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
      updateProgress('✅ Created 9 rooms');

      // 5. Create Classes
      updateProgress('🎓 Creating classes...');
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
      updateProgress('✅ Created 4 classes');

      // 6. Create Divisions
      updateProgress('📝 Creating divisions...');
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
      updateProgress(`✅ Created ${divisions.length} divisions`);

      // 7. Create Batches
      updateProgress('👥 Creating batches...');
      const batches = [];
      for (const division of divisions) {
        const numBatches = 2; // 2 batches per division
        for (let i = 1; i <= numBatches; i++) {
          const batch = await batchService.create({
            number: i,
            division_id: division.id,
            student_count: Math.floor(division.student_count / numBatches)
          });
          batches.push(batch);
        }
      }
      updateProgress(`✅ Created ${batches.length} batches`);

      updateProgress('🎉 Sample data creation completed successfully!');
      toast.success('Sample data created successfully! You can now generate timetables.');
      
      if (onDataCreated) {
        onDataCreated();
      }

    } catch (error) {
      console.error('Error creating sample data:', error);
      
      // Better error handling
      let errorMessage = 'Unknown error occurred';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.detail) {
        errorMessage = error.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.statusText) {
        errorMessage = `${error.response.status}: ${error.response.statusText}`;
      }
      
      toast.error(`Failed to create sample data: ${errorMessage}`);
      updateProgress(`❌ Error: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sample Data Creator
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Create sample departments, teachers, subjects, classes, rooms, and other data 
        needed to test timetable generation functionality.
      </p>

      {progress && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {progress}
          </p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          This will create:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• 4 Departments (CS, Math, Science, Humanities)</li>
          <li>• 10 Teachers with different specializations</li>
          <li>• 11 Subjects across all departments</li>
          <li>• 9 Rooms (classrooms, labs, lecture halls)</li>
          <li>• 4 Classes with divisions</li>
          <li>• Multiple divisions and batches</li>
        </ul>
      </div>

      <Button
        onClick={createSampleData}
        disabled={isCreating}
        loading={isCreating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isCreating ? (
          <>Creating Sample Data...</>
        ) : (
          <>
            <SparklesIcon className="h-4 w-4 mr-2" />
            Create Sample Data
          </>
        )}
      </Button>
    </div>
  );
};

export default SampleDataCreator;
