import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user with salted and hashed password', async () => {
      const data = {
        email: 'asd@asd.com',
        password: '123',
      };

      const user = await service.signup(data.email, data.password);

      expect(user.id).not.toEqual(data.password);
      const [salt, hash] = user.password.split('.');
      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
      await service.signup('asdf@asdf.com', 'asdf');
      await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signin', () => {
    it('throws if called with an unused email', async () => {
      await expect(
        service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
      await service.signup('asd@asd.com', 'asdf');
      await expect(service.signin('asd@asd.com', '123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns a user correct password is provided', async () => {
      const data = {
        email: 'asd@asd.com',
        password: '123',
      };

      await service.signup(data.email, data.password);

      const res = await service.signin(data.email, data.password);

      expect(res.email).toBeDefined();
      expect(res.password).toBeDefined();
    });
  });
});
