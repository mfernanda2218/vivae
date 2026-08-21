import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: {
    findAll: jest.Mock;
    findMe: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findMe: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('delegates list to the service', () => {
    controller.findAll('actor-id');
    expect(service.findAll).toHaveBeenCalledWith('actor-id');
  });

  it('delegates current profile to the service', () => {
    controller.findMe('actor-id');
    expect(service.findMe).toHaveBeenCalledWith('actor-id');
  });

  it('delegates detail to the service', () => {
    controller.findOne('user-id', 'actor-id');
    expect(service.findOne).toHaveBeenCalledWith('user-id', 'actor-id');
  });

  it('delegates update to the service', () => {
    const dto = { name: 'Novo Nome' };

    controller.update('user-id', dto, 'actor-id');
    expect(service.update).toHaveBeenCalledWith('user-id', dto, 'actor-id');
  });

  it('delegates remove to the service', () => {
    controller.remove('user-id', 'actor-id');
    expect(service.remove).toHaveBeenCalledWith('user-id', 'actor-id');
  });
});
