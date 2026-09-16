import { BadGatewayException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Repository } from "typeorm/repository/Repository.js";
import { CreateCategoryDto } from "./dto/create-categorie-dto";

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>
    ) { }

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find()
    }

    async create(body: CreateCategoryDto): Promise<CreateCategoryDto> {
        const newCategory = this.categoryRepository.create(body);
        return await this.categoryRepository.save(newCategory);
    }

    async bulkCreate(categories: CreateCategoryDto[]): Promise<CreateCategoryDto[]> {
        const createCategories = await this.categoryRepository
            .createQueryBuilder('categories')
            .insert()
            .values(categories)
            .execute();
        return createCategories.raw;
    }

    async delete(id: string): Promise<string> {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            throw new BadGatewayException(`Categoría con ${id} no encontrada`)
        }
        await this.categoryRepository.delete(id);
        return "Categoría eliminada correctamente";
    }
}