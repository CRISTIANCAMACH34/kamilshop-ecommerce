"""Contenedor de Inversión de Control (IoC) e Inyección de Dependencias."""

from ..driven.persistence.in_memory_product_repository import InMemoryProductRepository
from ..driven.persistence.in_memory_brand_repository import InMemoryBrandRepository
from ..driven.persistence.sql_order_repository import SQLOrderRepository
from ..driven.payment.mock_acid_payment_gateway import MockAcidPaymentGateway
from ..driven.seed.seed_data import populate_catalog
from ....application.use_cases.list_products_use_case import ListProductsUseCase
from ....application.use_cases.get_categories_use_case import GetCategoriesUseCase
from ....application.use_cases.get_product_detail_use_case import GetProductDetailUseCase
from ....application.use_cases.list_brands_use_case import ListBrandsUseCase
from ....application.use_cases.manage_catalog_use_case import ManageCatalogUseCase
from ....application.use_cases.process_checkout_use_case import ProcessCheckoutUseCase


class Container:
    _instance = None

    def __init__(self):
        # Repositorios
        self.product_repo = InMemoryProductRepository()
        self.brand_repo = InMemoryBrandRepository()
        self.order_repo = SQLOrderRepository()
        self.payment_gateway = MockAcidPaymentGateway()

        # Siembra inicial
        seed_result = populate_catalog(self.product_repo, self.brand_repo)
        self.coupons = seed_result["coupons"]

        # Casos de uso
        self.list_products_uc = ListProductsUseCase(self.product_repo)
        self.get_categories_uc = GetCategoriesUseCase(self.product_repo)
        self.get_product_detail_uc = GetProductDetailUseCase(self.product_repo)
        self.list_brands_uc = ListBrandsUseCase(self.brand_repo)
        self.manage_catalog_uc = ManageCatalogUseCase(self.product_repo, self.brand_repo)
        self.process_checkout_uc = ProcessCheckoutUseCase(
            self.product_repo,
            self.order_repo,
            self.payment_gateway,
            active_coupons=self.coupons,
        )

    @classmethod
    def get_instance(cls) -> "Container":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance


def get_container() -> Container:
    return Container.get_instance()


def get_list_products_uc() -> ListProductsUseCase:
    return get_container().list_products_uc


def get_categories_uc() -> GetCategoriesUseCase:
    return get_container().get_categories_uc


def get_product_detail_uc() -> GetProductDetailUseCase:
    return get_container().get_product_detail_uc


def get_list_brands_uc() -> ListBrandsUseCase:
    return get_container().list_brands_uc


def get_manage_catalog_uc() -> ManageCatalogUseCase:
    return get_container().manage_catalog_uc


def get_process_checkout_uc() -> ProcessCheckoutUseCase:
    return get_container().process_checkout_uc
