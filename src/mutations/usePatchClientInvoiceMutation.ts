import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateInvoiceRequestDto } from "@/api/api-spec";

const usePatchClientInvoiceMutation = (invoiceId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateInvoiceRequestDto
  >({
    mutationFn: (reqData) => {
      return api.invoices
        .updateInvoiceHttpControllerPatch(invoiceId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchClientInvoiceMutation;