import PdfPrinter from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createInvoice = async (data) => {
	var fontDescriptors = {
		Roboto: {
			normal: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-Regular.ttf'
			),
			bold: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-Bold.ttf'
			),
			italics: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-Italic.ttf'
			),
			bolditalics: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-BoldItalic.ttf'
			),
		},
	};
	const {
		orderId,
		customerName,
		customerEmail,
		date,
		title,
		description,
		quantity,
		gatewayCharges,
		ogamount,
		tax,
		discount,
		total,
	} = data;

	function createCell(text) {
		return { text: text, margin: [0, 5, 0, 5] };
	}
	var dd = {
		content: [
			{
				image:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAABiCAYAAADJA78IAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEAmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI0LTAxLTAyPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjE5NGE3ODJmLTkyZTktNDM2OS05ODU2LTEwMzVmYmZlNDVjODwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5CbGFjayBhbmQgV2hpdGUgTW9ub2dyYW0gQnVzaW5lc3MgTG9nbyAtIDE8L3JkZjpsaT4KICAgPC9yZGY6QWx0PgogIDwvZGM6dGl0bGU+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YTwveG1wOkNyZWF0b3JUb29sPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3InPz4IEK9nAAAgAElEQVR4nO1dB7gUVZZ+BHdmdmd2nFl3ZnZ2HUUxPXJ4ZEVyzuHl0PkFkoCICijBgIqCiChBRBxUREkqkgUUcTAiSlAQQRCUnHndfc+ec0N1VXX1C9DvAXrP952vqqurbqp7/zrn3nPOTUjQpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk2aNGnSpEmTJk1XPnlzIMHnRnZBgl8ynlfw5WjWfKUy40d/DvVnxtmLrOlXTvnUIUSnqIBAVymAPLwfAl6OAXz8XLPmK5n9kgNuqIj9uqIvGxLyMsU1Tb8iyqZOgNIcgZ2rU0TCw2sJ/f2Q4M2G32CH+SNKgVd7suFqr2bNVyCrvuvPgv/E/vw7BD7RzxEAA1wSZBr8fukUkGosqa8BId2JTtCPH29ATkOehLwMeRdKgSfweBz5hGbNVyaLPhwQ/XgP8ivIjTkAZnCJj6vBAa3+/vLIHwE8ArhKPiHtEV+Nv3ORN2IHOYdHCBC7NWv+ZbHffO7i/LyvB6q92QL8Alrq+2WR36UmdaEi7JbzdjnwZzyOxev7eSeIdIoQnhfitRByGEGQ+Q1mpnPNmq8sln05jBzEfk5HAr8FPfIhoR9Kfhr4fkFU4OFzGVzKQ064J58D4EBkDngC7FgwwIGOgI2DG10TneUy+FJr1hwPFv2ZMXFOR3ae/+eCR/Eo5vwy4wh+eSRxkKrlFke/m5WO5fN+T3wRmaebY53Ux3wqcOaT/qyCmPwXZaDyZ18hXwVfDkvwZImyYtkryzr+FXlVBPC4ZKekOtBgp/nXwKqP47gO+8Xvs8hVAmKer0LcBmFTtwCVwciDkO8qDSPwiSOKo3ECvkC2AXaVsOKV8gIIatkG8AmWYBeQRwKRXLEggCDCSHqqEMhmCcmZl+eEKNXHQ+K7m5eV6tAQ+Qf58gulyE/nGuw0//qYPvb8nBXyo4vdJ8d+pcDFjmkXJtQTuYsEvn4IIgV4LBW76cj4MQ+BL5/YXToA9KQrMJNg54WKhoEuXs/1QoI3EyucA7/D339Cvhb/uwX5BmyQvyDQ/UdWOlTIVVKhkhDzxMoogWBe9uUjCeb3QCBPFqAXEPN5fblk5+Zft0Il8WnA0/xrZjnHF5TniwJC3eUa3kWR32WsJP4Gz+cioKxE1XUpHt8tFbtgOR4Xoqp7Nam7/hICn8/LErwC8LitmleBloeX6Wrkdn4+wQ9LsbKfI0jsx4qfRD4t9f+zyKcwv5/8tOrpxjq4YBRyT7z/Or+fRYDQzU1DKhI45nnFvNqlIC+BeB6vYyUxTcAyIkDHgkqlxd8a9DT/qtkvpL5QQCzufYSCWgWPu+T4EpNoTozAxuOCf8fEjuGA4yib6wFAcCiW6T6/ybzC72F/lcBXpB5umbPjEplQV7Es/4HH3shz8NqPqgHM5XFqIPU/HSONxk4LwAS/n6RCKdUimFbE3xW9gfIHPp+ch/ShpMfnU3M4sKuXHOJld2nV9tIMMmYc/a5wMRzix8j97JKXv2zqqZhZni1HZmpc4HHd+/dBQpacBrsokmAjgM8Fe6W0UZidBqG0PhBK71sE4/9ZqbxQXEpBYDmOoPeX4oDPH1FFKwa8XNKj8/9GfhgbdjdVUgEZAYAnixVSPpRfZgoLuzOBebOBoXqIR8bcmYzh/2FenhQI4v98fswMhPj7ZwSUZ5GTIio0qyTtgzgglgf5pMmKLEMV5KOyfCE5iatB7zIAhX4BgIH5AAPyYrPon1cO4FlZgHW+r+g6DkQu8Evhxl2+dfW7DTMXpeq+iGXgK7u+eKi6HPjcXOLbRxkgmISffhLgzfkAr70CMO/VaKbrb7wOMPUZ8zwUO1US4PN5pZQXWa0NIB+gNAiokEOuDAhmJPPJfTZ8CLApT2N+84CtXgnw8b8ANn8BsPVrgC2bAT79GGDtewAL3gA27VmA+4cBwzRYZgqw7DRSHVnQLClimm9g3tVIAnSn8kWSigR8eWWs+gayhT9iQgIkDBrC6/2+X3SmQvn1ZZIv16/vL5pVe3qyTkHHth/Bnc3WQMs71kKL298zuCU/rsXr70F6373Gc1fSuxDl5eMVenffivXBelKdbPWkay2wDbp1+hzvjUi35VZWoeayAE3/uDkQZgi8YJUuejCKKAhK1WX7CHhy0iFMYFIS+vYbAsrigU9FE/Fl8f+46UYgB67D4ztKtUZGSZOFEfTYmFHAFi8EtmsnsPPnS1YWRcFCgL17gC1bCmzCeCwXgSCCKJaTAFAuk3MpdUxGT+4MTSvDlfLxmFlG6m9A1NdktsIGSBW3UHYmhlIGK+rrS0xf6Evx9f01sC8nBP1zAUFtIbRo0RLGjXsEhg8fAffdN9LCo0aNhbw8DyTe6pFSX/iKAz4xzk9DYmJbGDbsbrj//gej6kk8cuQoqF2rCST33Cv7Xrh8ymmYsxhq7reIIb/1x2N+j4jP8bmVxKeAj4U3vC9ApBBBJBSKZgIXoi83Fw98pgWUhIAwTyH1sjVeP0bPYech9TSMgAtPPg5s8+fAwmErmDEWyTtMHLay+o/us9Oe7xl7bS6wu/pxACQD4GCu11gx+gyZS38ITJXdymUszraA/bJ5+tzlBtP+K7bDIdkJ+UquJ+sk69TuX1zCaH3nemjdPJpbNV/Lv9BqHvZKGmxXAhPwDSoAaFBvDjxNKk8RdPz4fqhVwyefvfKAj0Asrc9RaN8up1hBwuPOha4dtnP1v7yAzx8x4VLTaFnK4iMuA9IfCWfEVV0l8X24QVRagYmdFTBt+bJ44PNJdTqX5vRE4d1qQp+kPFJJR9yDKusnQLBlQFdIApw5XwWCRZ2r8tmB8MgRYK+/CoxeenYaMATcQtkRTmB528hwOJV4vLs4mr5Quq3zDJtEAv+p4mWyQillsJZ3vAlNmzaFoUOHQ37+AOjXb6CF+/e/C6WMANx6Swt8P6fkotKVM9iuBKZ3QfN6jZLmwsMPj+N95syZs/iRDxp8/rz44u/cuQWBzy+fvfKAjyTV9L7HoHWrTKzjcRwrDIWcQqOehaa6ZqR7oFvHHeUHfBFpT83trQ74WEJefhwFEqXqel1m4GMW4HOi0gBfdqYAFG5o7ObzeWo1OIQABLNfYOzsWQF4SrKzA1ppyA6ECgQV7UU1+LGH+RwgdnamGpc4E88TBuQL4LvolSPVxtliQYOvXLtZI7NRMg42NiifpIzZMHnyU8XWrWOHHEjtfViqHVfOYLsSmEt8BHz1/wmPPvowb28CA4adSHFYdvzd32+9siU+BL60vkehTetMrONpOV6Yra5iIGVmeMsV+EzSnhiXOVBfLYb64uUZJlRdZixuOEl8TlQS4At4WELAI9VboT5mKNBDCTOEz8GqFREpzyyhmYHvQskuKdoAkNFiiVw5DhmN7IJ7SR0lDxBfHIAvVwYfCHgRTD3cZm+dsEIHPmFLwMeljPpz4LHHHuEFO3fuHJYzZHAwGOSd8Ny5U9CubRaqKEc08JUBOwNf0Nbvf9nAFxk7lwb4/CJQAYFfYUCMx8m5wmi5Ur8BwhQsLmQxZzHN8cUD+JR7iZzjI3csJkCPhRD44JNNAvDUPJ0ZrJwAzA5mTqzuKQoAzeD38BhgrgwOxuelOcnMAHmKCF/gi25baThdWXqlKBU/KF8wU+pVQwS+xx9/VA62wqivL1EweAbatdPAV1asge+SAx+TY1B5MB3A3/8lx1GFnNQ4zrvbzVniCnzCG0PFk9stKxP0ZAFs+qh4Kc8OamrOz4nM/8cCQ9v8JJv/GjBaUMn1MDnXB8v6e1mCO1sEAb1ot5iEBBlAESW9bPgTpr9P5hOWy/MxgC9oq9svG/jM5iDq3H6tPMqhge/SAp8p6lBQal8BKTBUVlsrxI3KFPg8rCK5ZCHwzaD/ublKKsC77wj11g56dsBT52FbGVDzg9OnAI4eATh5AsDJ3CUWoKr6vL+ObPx4g6s5vh0Uwl2uPht+whdKAem/bIqg/FRAGof7hacLU4PtUgJfNOCEwecKYbmCkgtN5yHDdMP+3IUDXJinq/ISHhHEkbzF79IBoXNemI/LVC+XtU7xBL7YdQ06t61DHUvTrtHvMCjrJ/NwWdvxcgM+EYKKH+W0E9tQ4GMJA2m+3cXi714af+BjHPgCbiPMEpmt0CpSOCsF2HPP8NZlSjJTwBRpcOucnDo/ewbgg/cZmz4VYNR9QPNirF8uMFoRvWcIsCcfB1gwH9iO7WBKzZqGqss32xXoqEaGk9ykJRIN5qLnEgIC/CvKqMp1IpO1PMaYMMy8hMBnd1uiwUHvXnksDDRZ7htW/OTJkKs8FkLGQCpqoEYPZpEXmeQorwFzfuQlQNdVOci8RHlJCBAs2k3Mnp9PupZRuqr8islmj67RkeruzT4vVnUvAvii6yvaicpvtKGtbXn986WHhDss61k8AFrzCvOPhcqHuL+prio/altKX6zqXj7AFzAWNBgZLNPvZjL6eKUyCT5aVhIfDvyKFKmFL0W7uTdI8K7+wqTE/HxRoKcur13DvTcgK5WxzBQWcmdCkLxLyGXNh0dyaUPpjXt6UFnGPQiwfi0jidLIS9Xj8GFgQwcCuDNZ2ORn3FGCXuV4GEgGskUaeTxEFl/RXSkmao0VZMMlrbyBL3qwhHiHpoHhzgxze63GSa8iT8cyPQX1aj8ISfXGQ+MGz+Hv2dC2xUeQmXIK+vnFQBI2hSHHQW++psCOBiOBGbV7Sq+D0PrODxBoXoIG9Z7CfMZCnZpDoEa1fASVIVCz2nCoXeNJaHH7Snz3Jw1wsANDrLoRIFEZ6T337LoXmjVeAM0azcS6TIAG9R+Cpo2m4vlsaN/6E6DpF2oDKlvDenNKCHxWc5botg3zNKl9qc3a3LkB23AW5jkVkuo+jG07GhomTcK6Pw9NGsyH3t1+4GUlqVPMhQejPlROHy66j/Kgts1IPsVtQZs0nIX1exbTHofnTyHPhOZNl2LfOSYAEcuV2vvQZQF8fhV+ijsVcBvVGX65oJElFhrjhHYmKhPg8xquaC0DUtojW71lSxkzp+m0CGFOG1VYNnWyMDtBsAtROtz1zBPdeMq3F8/DrnQWykphbPRIgK+2RFaNUUVmD40mGz7G8rwsJOcR7pKqaGVfFkuIx0quP9u0ku2CdDlvEfIrFxxTucsT+Mz302Ap8InB0rn9FqhV/UFo1sQHblc/eOjhsTB79nRYtOhVeGfpPHjrrXnw6quzYeLECTBgwGBo19YHNasPgjubvcuDU5BE4QRGalDSe6HBTAta7Vtvgrq1noBqiWnQqlUPTO8umDTpSZg/fw6sWbMENm16Dz75ZD2sf/9dWLDgJfzvMfB6fVCndntIvPU+6N19N0/LSdpUv3nd/KJP3NFkMQLqAMjOHgRPPPEYvPHGq7B69Vuwdu3bsHTpQpiOKsSAAUOhcUMXAtEU/i7uaLIQHnlkXKmBz9K2UnJt1XwNVE8ciADj5m1HhtHz5s2Bt9+eB2+/Mw/efHMuTJs2Be67bzj07OGGurVzEaxmgisjyMtSVD0FCDEO7t06bYfaNUdAl84FMGLEKHhpzguwbPkiXs9Vq5bg+5sDo0ePhk4dvVD9tqGQ3HM/jVsOfOcvIfCp8WBa0DiM/eTv0p21gi+rjNxIy0ziE4a6L9B1/JoGhw8FduZ0xFbPaSHDDnrjHwKW3ld4dnDpTDTMJuQHkFOQO/nFjmN3I89B6WqPCQTJE4Tc38jnmIPf9OeAoVRI/6l5tinSoFi4rcVpHgFfXAUygsZ6/8FPQRfE8nzIPLdX3sBnByPKM7nnAah220BIS/PAkiWvwfHjB51fto0Kg6dh08dr4e67h0KtmpnQtuX7PD0h/Vl9OglYU3sf4YO5ZvUUyMjIgRdffA6+++5rrFew+MwknTh5BOa8/Bw0btQeGiW9BP0DKj8r2PK6IRD06b4XgSAADzwwAnbv/rrY9I8c2Q9PTBgLjRoMgCr/GAETJkxwfBfFSXyqbXt1/Q7b1gt5ufmwYcMKQ6oqjnbt2gLjx4+BpPopCMCLePs5tSv1G+oD1Nfr1poAyckeWLduKZbvbDE5FMLy5W9C+3bpUOO2yXj0YNlO8X+KBr5vykbiMxY0QC1oDFTal9pnt0wovsAHBHx/lWBCq5gH6GtPKuibr1tXcYsxOWHPPo0g1Zd/NY3FBwK6/JHm6MssEt7Kw1d9fovXSG1dZzKSDhL4jbxXhW6HQgGgbAUZQ+YK4+KLNl0hIuDMd4N5QeNRI09ptGx/8eUBfPY5J1JzmjddAs2b90VpYJHtvYZ5/mQ7aLUlDPHrIVuH2LXrK5SmvKiijjekbqqTkkgaJT0OLe5MQWlxPOzZsyOqH5nTJab8idVve57B4FkoKPAiiI6VAzFkBT1sy3atNkDLFimwefOHpnoxSz5mG0kqg6IdOzbD3/72dwTMB+W7KIxqHyJn4Atx0G1x+7vQvn06fIwfB6e60jG6DEHLmDh0aB+4Uc2pWU3U0wryYf7+XRnnsQz9YNr0SbZ8nN6fPY8Qvrd0lLxrGnUqb4nPb+ytYdjRftqlB1TISFXeZGUYOT3+wMf+RwJSh4gIy9j3uyPzbXa7ZLO5CtHqldynlkt6Mo0PacNsDnA+GU5KhJavKI+VaU6Rvg6kqubnctDp6pdh3Gk1GfsQ/6rI9L7x5LA/ypXbihy0yF0NG/piJlIl2FWUYEyLJcpMhgcV9TuEmypr4IuoRxFgqF39cZS8UlGqPiXfcVgOCqvdoPloP1egpOjppx+FG65P4epsxHEfoMr1rWHbtn8Z96m8aLA5pWuus/0/MwgNGzYA6td5htdHrYwS6LRpsQZat+4Ep04dkW1ZaMnLyT5SnZ+X5gFbtmxBlXi+LK91AMQCPtW2SXWfQ9XcQznLdyYAyCk/JxYfnkg9H3poJNRIHClDQ4l5Q2pfT1YIbqraA9599w2jXUOhYMx8zL+DwUj6M2bMgJMnT1retzovc4nPmPphcjc11kZaVVTylHW09DIAvr9L25tH6BrFxnvgfmG6IhrU2SNDXTuFY/HuQVw9DkmJbZfXxf4kQeoqWizw2hrFL218uOTmxnu8YkUZn/kHHjcr8JMgdAav1+D3u+Hf/ASYklUghQuZ5wu4ZVw/N6sQEPV/O2ANm+0YY688gM8sDTWs/wIOzGwjbRoERQGcHTTs9wmJQnSGF2dPgZtu9IqVQ1chXyggtXTcuAdkvaLzUtII/cd9RU1A4TR4xX+i7F27pkC3TluN+bTU3j9Dg6TOcPjwfiM/expF1U+lb293a7+PBj4yGVFzg16v29S2wRjtZc1DfXTMeZrbdejQAmhQbzpvT2/2Oa7+3nbLIJg7dxr/nwC7OLBTkrS6HjatHl4Kic+yoMGlP/inxA2+KOot6w3DykLVDYjV3Lelmht86YXIM7HUXJXPmlW0mEGLD3JPTTd0lmB0lQymEA06MuQTSWzchpDUXq9QiQsm8LIsCoj5tbMITs25iYkXjHuNZy4C+OROc5VkWbqLeT0WCjgsaJQX8Jnng2gBol3L9fh8RyNdNQCdwEUNOvM7sg9Q87kq89ix96KE8hCvU66H4fs/gWDUFT9oR41BJsAthiW6qc7mAWn1YBF5ffDBCki8NZ8DH/HNVT2wYsVC2YbRoGeutxrU5vxUe5gBwg5+UeYsLrFq26PLN9CmTS8qXVTb2ttb1OEcnD17yjHtaHAK43tLxjy+BbJIaNZoPgRooILoK7FAT00Z2Mks3TuBnvpdZsAnzVYiCxqMzMmulwsa8d0+MuaAjTfweeGaqZ/wCmzlwNcXwvbVXDuZwZCiAWWnMiXtvZfr4/N3fA7OG0Pn90svC58bqvMFFRdMlzwL+Rnkl+VXhhYanjbdMwMlSDpOQ56N/zfwm9TfkpLHy+f1KuQK8P0Nnm+Xu0KFYs3tlRfwiXvEfdUSk2H79s+Mzm8eLOZBoej48Z9g375v4Oef94KaoLCDgvVcPNe+fS/o0fkbXkaqW/XbaJXxedmfIoB35MiPsHrNEnjuuYkw7qHRMGbMKJg48RFY//5yUz+zDszI4OapYV5pkJV6Bjq3+wyyslyyDs6AbgY3oqNHf4QffvgGJcR9xjUntdRMThIfmfbUqTmYr0jHaluV76efbuRzd02atMYPQhssf3uY9PR4I117fVVaa9a8hVJeLs+rVs0U+H7P9qj7Y0muZ84eh/37d8KBA99ZFlmc2lZRWaq6MggBcA8NMS6HSzOyytwipDy2h40z8J3Ggv8ZpTLaN+OEVHXZx5vkMzHi5alrZ88CfdEorLxSDwdLI8bKniKiMvgjpiNdpNgMUr0FiruXK/bqCOd6jYCnkGsOSy/yIpYxv0oe4dUv4xn6IwbbI2X+weJArzxUXZV+kwavwPDhQ2X6ztIQzRERfbF5E7hcfmjUIAtq18yFunWwYTunczMMe5mcJLGVK5egJDaQDxSSxLp12sbBUOR9Dl5/fTYOpkyoU6sXSod3Qd1aT0K92tOhXq3pUKv6o3BjlXTo1Kkb/Hhgn2WAmvNTeZEZSKvm66F+nVGwdt07sh7RwCdAT6Szdt1ySE3xQFI9Ub96dXOgZ48seGfpAiO/kgBfzepevlDUtuUHkJvb39IGTu06Z85M+O9r6kBSnZnQp8f3kN73MLRv/SH8/W9ZHADPkpU+RIOZ+p2e1h+q3fIc3H33PVF5mY+q/ocO/Qj33DMMbm+WjvX0Y3v7oGWLdHj00bH47PmotjJTGUp8KgiB8tD4yp0OV/FdFskMrLz2wSkD4Lsa0/kbnp8VE+rAtm2NPOMEfCqtH39EgPKJvTQk8LWVQFSkBCY8JHjIq/b+iFsY7dMRRLU5mJXC9+IA8hyhPTmIM+mYyn0CC2m3Ngl8yf5SBjvMc0sPDaEi34hlPS3LHpYv+ZIBn/KUyPOQtJcDW7d9agysWOrj4sXz4Lp/tIR2rTaBJ0upygB9exyA6651w7Bhd8k0nBcjxCWG5ewDfbrv4+Uke8Ea1VBa6Z8Gd9zeBapc54EWty8DV8ZZPpgGSQ8Ng7n3xOuYRmeZePTAVOWdOXMaSpQToUP7gMUsIxYYTJ8+Bare4ILunXYa9aMpz55d98C1/5sMjz021rjfLg2rtiMSwOfmwFe75r3w3tq3LfnY892wYQ2CXgPISjsJd/WLbIxF9b8b1debbngA8vM9UXmrKQaiV16Zj6hwDar46x3us+a3c+fX0LBBN1SL38LxfB7kfDOXjmskPoVqeQc4deq4pU7lIvFx8xW+mqvsaDspYcNfntu/lgHw/SeC0A0BkwnHrp3WZ2KltfNbcb8yAUGuFpD7aBZTh4pyJbm9BB0yUGbPTsaO/hzAtKnRTNefm8IlEgJaZTyZUhrgo3nC3Aw+P1hRTszOs03YFrtpUFkDH0lcfbrvh+7dcmRa0eqtGizbtm2GG6q0gsyUE3BXAUgVWRjJKheyf/yfF6ZNnyzLEz2/pAbp+McegaYN54lw+V4Clk1wc9W7IbX3AbgHsfOewdKFigDAHWElqQ8ZACj5uVEVfstSRpWXUmcXLJgPf766F4wYMd5SJqf6rV+/gkuTyq3LXD9aMKC2+vv/9ILFS+YZz8UEvt1bUYLKpRBu0KqlH6W1Y5Z2UOcKPHr06IOS71dw39CIq9wg6b5GbU2/qyV2h337dlnyMUt8u3btgltuvQlOnDjpmFcE/M5D69a9oEObL2DoAKXZiCkPqjstHtatOQOysjKNvOxtViYSn4up6CtKo1sQEP7sFYWKW4bmK3YqE+BzWYHvu1IBn2HQSFLYbVL3LwHwgQF8VB7sUBTctEiifIcOol3cLgz45H7AKtagkjb5BknFSXrlA3wi7WaNFsGoUSNlGsGoDq6Awev1oiS2iksk5Ldq9hRQBrPZaWegTu1OcPzEIeN5pzm0lSsXQd3ao/iiiif7DAc5Arys1NNwR5N3EDQeRUnpHjwOxmOBhWvVyIP6dYeghJQEL788yyi3mRTwLV68GCpVvBHve83xPl4+OYC7d09DSe8bi6eJ2fCYBjYZPjdv3gVo/tDc9pE+o4Dva1SVB0HHNl+B35/Pr5EqbV9cINq6dTP821X/gAb15uJ7fhn5nxamUPfNGi2E3/2mMbzxxj8t9TCnd/z4cW5fqMxuYs3PvjBrKtSq/jgM6S9Wgc31FHUVq9A33eiCdeuWybJbB3q8gc+0Y5ryWSeN8CY5vit6fOW81WuZqLquiKpLFS2pqrt/H1cBGIKIaKwcuN0vrLdLqupy20FfNmP9EfiOH4+kb2ciAsYhAy8M+PrLVeAcFM9dAvw2yzTU5seXFPgMLwIEnMYNZsJLL820DA572ocO70OgSuVqnzKWjXYFEwOmdo3ROEDnRA0Ys3SyZ+82BK+BXNqgZzq23QS33JQLbVqnwf333w8vzZkGq1cvhi++2ICS5qd80cXM27Z/Cju++QpOnoz2KhD1EPkuWrQEKlf6K7z33ntGecz3qvLs2PEFVK/mNgVYcPb6oMFdPbE/bNy4Kqp+5vS+270FGjUYBo2T3oCHHx4r31uhY94kqT300MPIY5DHyqOZx3IeM2YMfP31Vsuz5rqfOXMG3n///WJV0+TkbOjaMbJHRvR7lB/ExovgnnvuNvpFmUp8LiPWXqEEwjF8/l7uLx23AKMlpbJY3PBnwu/x/CRdQ1Bhn34SeaaoxY0zpwEG97csbvglEFUupg5K4pPABxz4TpyIpG9nonPnxGJKaYFPbUWJz1SWRst3l2ZBo7wkPhrIAzjwTYR33lGGrlZgUAP7gw+WobQ1jHduEcLIGhVESX1i/m0ujB07Wpa1MGrAEB07fgBub9afA1/tGo/wOaWVqxZhHyjllnkQDXqiLUQbLVyIwFf5agTQz4us3/z5L0FS3cf5h8As7dmBT72aze4AABtvSURBVBghT4YZM56x5KPIDHwNk4ZBk4Zz8d5njXudFglKS2GbamSehz169KhxzandT548DE2bZvF5PbUvi1MgB1Lre3XbA716Zcrny86Ozx8BPbl3NPsWx83v5MJlkdpcmVF8gY/76l7ToicXX7fT15W2dVy5POKu5kRmMKLwUhRphc9LuOAt0v19XqiYn0Gh252/Cir8k13iMwOfPT+iCwW+XBGEQG2Efi2+yOOyU6l0LjnwKZWGgK8eqpyrVi+S79P6EtTvxYvnQr064yQwFDqmp1yymjddDkOHDpNlipYUiE6dOgStW/WDqlWGwJCh+ZY87S5VyoCZNrex8vmYdmYKkBYsWAxXXfVHlBqjJSXzfRQIoGH9aYanh1O0E+Nd1HsRJkwY7/gurMA3HNN8HtXs6UW2BT1DdYmuX3R97QsWZi5qtVn9/vnQXqhdy8UXpMxubnbgEwbfh6B9uwwIhs5GpRl34BNjQi1o9FHjLFDekp6iMjFg5tFZ2DJpxxeaOyfyTCyJT+VDe+HSFpC0OCEbqbH0za3sczsHBy2JxGfPj+hCgI+L5ZmRTcjx3peklBeUK2clBr2yBz4h8SXVe8gw7I0lEVG0kPp1xhrA5zxgRFlvb7wUhg+/1yir02A/f/4sXHttojGBLspvXXiwg1QsKk7iu6ryH2EL7SzvkKax+vvCVGhQb4oBfM7tpd7FLJg48QnL84qswHcPNEp6AdV2Z+CLVfaLJSfwU+cUbKFunWxjxTqWxKeAr2OHTEMKLwvgM0VfUVrcOyJsHatAq7h5vwzg4xKfclmbQGm5MqDwodHMaFOzdGd9meKIkjwTrjmG4/K/EhKwjFkCkDwODRUt8RHwsbIBPvm/3Hu3pQS9sL8YD43yBj6luglV91l444258n06z4HRXFvN6v1kus7RgCk9ejdJdWegRPRIVFnNoHb48GFITLwNDh48aORrrovKl+zJKFDCrFnPoso4JcIzp3Ap7dtvd1ruVxSZ43sLKlf6M2zY8IFj/VS+y5a9CXVqjoxa2LDXj95FvdrjYe7cGTKfooDvbmjW6E14dupkx3vNJiYnsDOSwfQR5KPFMIHX4SM/8GPk2o9w7NhBbM8DUfZ75vNz509BiztTuceMmM90Ar4wB7HO7b+C9HS3Ua94A5/0wzUvaNBeOzV8ykOjPAyVY1EZSHx/l3Y5vcXgY2EcTAzfF1PPOQERsQoxv2QRMyKzCKmPzfblCYtusXEPq+TPYRVI3QzwvT3YVRKwOpYl8AWyRRjsNARhfJzu+1hKecoYs1yAj7aXjAQCiF6IsK/eNUCgmjjx8SLTPnfuJDRtksztvMxzQ/bFDQLSmtWGwNp1S2X/sPrVKmDYsGEDDBkyRJbbOlAjCw5boXHj1nDbLf0QbB5HiXMS8kQ8fwqaNJgBf/pjJx4vz5yGImNVd9ESqFTxOgT2hY73hZnIi7xP6tbJkCpgdLuJ9xfkwF+zugd2fPOFpaxGegbwfYXANxSl3+UwYsT9Rts6gdHRo0egerVaULNGMtSrm8nL4cyZUKd2GiTVd0GzJgPx3iyoWzudX2+QlANVb+wMLpfXSDvW6nx+fj9o1/Ij/q4ikXKs7/EuHnB1Nox/7KGYZb9oic8lTdNcwsID+Qm/2HyrUp4nfmHgLojKQtWlFVaUiP4Xf5/g83w8CGnJwlLJtNmj40QA0nyfETD0XfxC3CSlSe6zG5Ax9JQKjNyCyuEtA+Dzu2T0Fpda0GADlIpb2gWNiwG+jh1dkJ122ohGXBwP7g/Qqd3nhmeBk0uWAoux40ZB3ZrPc4NaYQah9qMIG2HZu3f+Ftpyn9Ro+zE6RAyLZyJoWVVA81wVUXJyCtSv/U/uf6rCrw+S4eHvHUJO/xSk01maikh8b8If/qMdPDZ+iiUvc9spQBgwoD9KaIu5jaCoX9hUv3PcjKdNiw8gNdVq32bt9xFzlvp1+0OPznugb98cI69Y5j0+nwca1X+T1zEn/Qy4M0M2DqJ2dI67pPXtsQduuG4wX6CgvkXhpwiw0/qcguZ3eODs2eNRba/eLdGa95bCzVX9MmBr0AjZL8L+F6qAvfjB6QW7dn1tqZe53S4K+NSUTyTA6B7TnjaXZkHDPqDjDHx/4fH4RKCCN+Q+vcGxDwhAUwMkFhipdI8eZez+YeRtwRh+hZXaewb5ebL2xkaskpsDf8br/4fA1xTzpBXg9/h9OcAGFsQX+PL5ChRKmQS42QjuLnZYPlPqBY0LB76zKJV1hzZ3fgF9euyHnl2+R95TJFM4887tdkKN6t1Q3Yq2vTOnf+bMSbjjjk7Q4vb3ODjwsOl+YXBLAErh06tc1xk2boyYjpjTMA90j8cD8+dHQjvZ56XOnz8NLVv0BXcGzbcFOfAQuJLNHw1WyvuG6zNg/frlUXmJthC/SYWvWmUYpKWSWUbQWJ10UucPHNiLUldr6NL+a27Yq4yW6Uj17dvjR7jxhpawbftmxzzNaZEBM7mBESDVr5cNBw7udmxbdf/+/d/jO2iLH44dHOgp3zzhSmn4NBPwtmu5EcvYEYYMdcOtN2fQlg0y3P55Xs66tYfBZ5+9b6RtblfR/iK/goJcqHbL4zxN9ZHkXjIFor5V/tEf+9s4oy2d+sTFAJ9pU3ChtbmVOyhUiutuaRdK8Z/jY3/x+aQ05oIedB3TDGWnAfv4X9bV3eLAj/bnGDeaNkUR6mSeyb8W+QxJlJjnaSVtyY7Et4ykDhkv4FNO06Zw8lNtmx5fEOiVFvjoSGHF+/TJhKxMP2RghyyO09M94HblQ5Mmd8DChVZ10NzZ1SDfhwOU/GqrJz4ILe9YjRLNLujQ+mOUzJ7HAdmVh2sX91vTMEtyP/10EK655r9h5cqILZyTOtynTwrmsR6GD454M9BAJSC48frh4PW6ZH+IlrwU8L322ixoUG8yJNUbCtu2fWy536l+X375CTRo0B5qJI7nPrY9u34H7Vt/BLVrTML6tYV161ZEtZGZ7C5rpDLWqv4wzJr1TNRzkbzFtU8+3QA1azbH+ydBcs+D3BicpDmajyNJ85aqA6Fdu26wZYuw/5oz53m47truOL7ChrdJw3qz4JFHlClRdF6MhY2j3++Dqjf4UXJeAt077YCuHb6GJg1e53ETH3jgvqj3Z+9zF+yy5opa0Fgd8CMe+GkPGpT4ytM1LRaVweIGDz3vy4MKHWZwlfATucgRoj0wQqGI1Gc+qnM7+AWDjO9/S4MhI5lv/l1ILmZSveSqAIGcJ4uRXy4BLLlDsbcXW2MAWl+qOJYY+LJMAUbd0EjY7IlJ2wtZ0Cgt8KmOeDG0YsVyaNykoZGWXVIgikg4IXj11VnQr98AVPtc4HYH4MknH0WJaY/lPvugUcEPHnnkSfjdb5rAm2++Kd+htT7q+Y8//hBuqnoH1Kk5lYNss8YLOSBd+3+tUS3Nwz4QCRNlJwV8r746E25vMgNa37kGRo0abilHLPA7efIoPPPME5CZmQNdu/aFtLQsLv38/PN+eZ9z5BpzWTjw1fBxSapvj32o/qfwdjNLnE7gd/jIQRg3bhR0aN8XkuoTZ0CrlijZef2wYMFcI59z1DmR5s17Ea7/RzcOkPRxSOtzFNXdVDh33uq2Fmu1/N13F6D0lw/duydDr56pMHjwINjw4Wr5rPMKsfp9ocBnkvb4+ETBob5fBektIthIuVJZAZ8RrSSHgwmPpkxzfUsWRfbUjTS+ucGjwY/owI/AFrwBjFRmfAF8tYiCGdCCAi2e3Hs3sBnPAXz0YWRvD5WenUoDfLkqwKjfmEtcZ/bHLalrWrwkPhFQkpWYFeisXbsGe9wfYMoUYWxrd3sqqYlJBPTAEfQ+/Wwd1KlFUsZyGDnSOunvBELffbcDxowZAT5fAAKBAILCCPj884+M/GLb8SmJ70WU9ibwQVktsQvs2bvDVs7Y4Zpi1c8slRYFfBSWivo2qY81qz0Ek54WO7PFaltr3iE+9XDs+E98YUkR3aruU206f/5suPmmPgh+J2FwP5IwH4PJk8db7omeXwwX+S7N9XQCvwtVdf0uI/qK0oYm58od0/A7Wv4eGrGoDIGvQl4A2cP3xlgmG4Wv7mzbyqJU3ljgR0fz+6PfqALDt9/wHdRg+zYOilGbiqtFFPWMmUoKfIFsJsLJu8Veu3jd44/s9M4CFyntXQjwlZbVIFq+/A2UrB7gUVLWrFnMrzlF7lXnai8K6vzmcPH2e0V5xeA7efIING7UFnp13cEllMaNO0Fh8Ixj2cU7ig1CTpGKzWQGPjI/oaAxLW5fCmmp6fy6AH7nWHWqfsK3NhIc1Skcvp2c9tWlMUOh4G+5qSds2rS2yLZVeTnV12lhhtzUiJ6ePBqu/Xsyt7OkqDbVE3vAzp1bLO3vVE+1X4r6UCnDcXv7Fy/xFQ98JilPjacDOG7+S46pCjmplwnoEZUZ8Hm4Pi92L3PBrQh+Zyht2s+WokMc+rn04FfMx9q4x/6s9YVGrpXEVxelPW5oieoubZ60T73YkkZfiZeqe6GkOve7776OeTzMpwWq3ninKXZd2NFbQLRV0dfM+0McO/YT3HlnK2jVfKWxmXXiLffBlGcf4/+T6hYLCMybAFF6CgQi7ywagMzAV7/OE8am2bVrjIcHHxwm02YxJb/iVMR9+/Y55u0UiJQWY0jlTe19EKpXawNffrmR36PqVVzeTv8pwCL6csu/4PZmvaFbp018ro92mOvW8StUeTvC6dNHZV7Fh583s+pjBw4cwHFQEs+NEqi6LrDvmBaQAkNln8s5evolIwP4XAR8LK4SX0DY6khpiWUIlZeFMH02YjgNFgl+QStQxZLQ1H8KCM1sB7uiAE+d09i6u4joLAPay42NxMub6DfvmHaRKm5RwEfuSxci3TmxApB3l81HFXQEX1FM7vk93HhDZ5g2baLpfZqloNjpRULHRzrGxo1rICmpLUpcb/O6eLOFyQSZZ1CYqw+lw78TEDilrQb8+vfXwrx5IkSU3SRGDdxXX5vFgU94nJznAFQjcRSMHn2fUT77hj9O+Zo3+Bk+fDCq3OPkuzhvuddQ0Xd/bUh85BpGJiME9r26fctV7kWLXjHSU0Be1KZHEbALGoBD9Mor0yHx1i58u0oCd2GSIgytW925Ctq26QkHD35veYdF5cPbQrbvxo1roWvXLihVnpXPhy1tolaIMzI8xUp8/ugFjQ3YBxIKcuUuiJeLiqvIxyMIM5vEB3EBvlw/pp3BTVsqyj0pnpTzfYW0yjviHjF3p/IpCrgulMxgyZg1n4MHhb0fGVnLl5Us4vqJiBGBHLFzWyCH3RZwMbktpdwxLQ7Snhn4GiHwPfXUhPhU2oFWrVoM9eqM5oOTbwaEkt8tNw2GLtjx3/9gRRHtx2K+i927t8Ndg/PhxirdoU/37y3uYFQvMoVJ7rkHbr6pNQLBP23pKmnTeS5qyVvz4fe//ytMnPhMkfUic5akuhNk3oWgYutRVOfevXvB9h2fO9RJBVK1Xj91+hCMGDEG/u2qRjBhwqSo58xEcfMoerN4j2FZZxHdJSf9HNxc1QceTzZs3fqp4/OMWSUsO238aA2kpKTDDdeR3eYpLuWZXe24F00+2Wh+CnVqd+TzgLHqad9fhGjBwlfw/feCJo27FllPouzs3OKAT4Ge2k1QuJrKIMLlEkq+tEQD3SukvrjP8fH05e5nWd2EXx6ev6LADwGWkfnCF5+LBQ+Vn106Ky3ZwU4BnvmW9euADR1olF1FYM42bI34/rhM7Y87IV7mK9HAJzpww/ovwgMPDMWynkX143s4dOiHuPDBn/agmnkKXps3hUcKFhLZWT4vNYBvx7gWB6kbOnXsDZMmTcABt5q7SomtJ5W6SdLIGTh16jBs2/YJvPzyTO5BUC2xN5Z7Nq9HP9PANIc/ouuZKce4d0ZOjpfH6aMIItHvLMgd7CkIaGpqNjSoNx6q3zoeHn10JITCp6Pa5ODBPXz/iGnTH4N6tR+xBB+gwSlCwq+DGtWzoaBgACxbtgh+/nkPBENnzLnC+cKT8O23X8LkyROgWdNU6Nz+U76R94iRgx3fBXmAnMDyf/bZaqx/pvRyCVvqTNIuSZ7Nm76F92ShxOSGF2dPh6+++hfW/RA3RAdj/S2EZTgFR48dhI8Q7CZNehw6deqBoJQD7Vp9yEHculexzZMmF3gI++qJ96P0lgUvvPA8fLtzM77z46BiCorxeg7LvxeWLHkdUpJzoEH9JyGl13FuS7l//3buEvfzzz/Y6voDlvcn6NWrV2zg45YNKoYmUx4a47ktL2pLgbyL27K1zEh5QSDHXeJT6avJTdLzhxXISMUuvu9FiNRM2vP2tbm0GhuBOcq3JCqs/boBduFIGqb72KefMPbwGB4Bhm9hGYhEjPjOL+YijQ3GPVkswZXB9+390jRpGzfQE2mGeGj27p0/RLWwIw6UPnDbrb3jyL0wzRS4/roW0PKOOYbkwF3a5Obi1KG7d/4GGjd4GaXCEVC/Xg507JAHffrkI2dD3z5+6N6tAJo2caG6PAjBbiqCykaxopkvVD01IJxiv1GUZRrANJCr3TYYkur3hm7d+qJEhBJToABysgPQuVMmDkYPpv0Mgs8WvnrZo8tGqHJ9eyx/3xj1Sub79rZttVACbwQclJ8y9Wcqa8OkSdCoYQH06D4I8xsKrpwClGSGQof2BVC/7mBo1ug1bk9HhtpFv4tevDxVb2yHZR0f5Too8hdeEgTGFPa/Y9svoHHSTKhbewhKWDnQrWsBb1Nq2969/FgGH7ZrXwSvPFTbn8X6f8n7hFBtQ45ta2lfn/iI9eq6B5o0nMNtGtu1KYDMjGH4sSnAug7CfAZD44Z50LDe09Clw1Z+P81NJt7qg1tu7gqJt0XXNZEfe0LVG3pBdvoRw5XRCnpyFTeyh/T6nu8g6KVwQ/9LDW+xySc3yxGqbmSOb4MwDofC8wJA7KymRDZ/UTTwEQXchnsZt+Oh1VI1ZybDYheSqcs9QwDeW80jJ1vgLWwCMQ6GYSvAqet2oFNEhtCrVjA2ZhQ3biamXdyCcic3kuRmIyj/SUWDlXN6HPz4dblxkliqL70/bvHgpwYMcEv9smBfjjUvQ+LkAyvEJRQaqAQgnqwwB4Hknj9xz48+PQ5AWp9j3IWKQIzuIyBTEqvd2T/6PMzzoGeIyXC3Z9fd0KH1JwhKH/H9L5J7/cSDoA6UQEz3l6RN7PXym3aV8/E0hOor/FZJOjqOavlB6NllL/TtcZB7o+TJOlklq+LeBZjqCY71p7T8qAb3l2H7CaCoDaktaQ8TaltqYyqTK6OQgx2ZxkQCiIYc29Opfek9qHdI9SCf6+Seh7Cd92I++3me9vZVzxfXd8z1i+RvAj0cv/LaXpTu/mLY7OWU045pF0JK1bUubkD4M+epiSjaubN44CPKFdFWKb8KGZlistPPdzVjHFTySPrLhGBWKrB7hwqbve92Rez9SkMEiBQUYf1aYBQ4Y0AeY5Suyw54LvgcXwwFNlBRV1QkZxLPlXvaNXj9lHl+r2xAr/gd0+KZVzRIhSWIBfnHSLlSKZ9fOhftFjL5fjoPyth5hoz0lasYMQ1ESj8CpOEi0yyuDWPVTe05YfZlVhGZ7QBe0nydQSFW24Z43e3tqjySStu2TnVW+Ti9P7UIY23fktTVXh/zXJ4BekeQq0uPLbUgeKlgrXiym7NQJVDFC099BmDp2wCLFgAsWRjNi/H6O28BzJwmdlIrDvh4Xm5jw+4KuShZBYSB841+CjjqMrZ+ZKj6BimAKTXwgyMYm/0CwKoVwL74DOD73eQSBXDsqOCfDgLs/g6AgHrlMmAvzQIY9yCwAj8Hu3BWCgti+YJqW0n5kr4hm7y0HijV5UhJVKriysCSNj4h1xpvFvwO//tBPheOt8TnBEZlybEGdmnKUZIBWXz6YRtHly9e9SpJehebb1HAX9ZtWx71lM+oHdJAGiqfl+c/I9eQpmuVA5fjKq6dLOYsKKqqSUoEjVBqbwil9UHu7cB9xP+ootI8mXJEPl4U8BHRfKIHOVsYB3PfV272wreZY6sD8gsqvsQIghlQmJHM8wlTGHsCRtoZrX8uQxbnuR5GJikUwDSM9wZdGUBgx9T+uRKUsYxsJXI6gtlv6eVgHflChhelXneWVSyncuW6OUDT+SL5goMyxHzc1V3Nmi9ntq3Y8rlxeX0LjrWqCvRIs8u9nCU9RXyOz1B14ZgQa8FQd4rjXAFQoADL72F/LQr4FBV4jFXeigG3lLyEBNgYj88iQH1H6ZnLIRuaz9UQsEkGvwkszYEMsAw/+SniK+2JkQOJPjnXiCDJQZdA2J0j5jidyO9iKihBssmGjwVMu0Vp1vxLZWmyxefy5FQPLe5x1VYuaMz2Z8HvJehxC4jcy3VOz05yAp/4N3g+Fyu40u9mS/H4bqnYBcvxuBBB72oJfMXmTXN+eT5xLwJTJcxX7WOR4MnmEmhr5DHIqwJC3TwpGl7Y3UmmL8+5gIjWsg/vXYjpDcfjnQjof+TpyzQl8FUq6f6dBIwFAXyZIg3pdic2Hzd2UtMAqPmXxczvMlZq1XlQMhgWEDnQM0DjNltsBi7n9i4WjsqPXFj4nshdpDTUD9W+AjyWit10ZPxIkVXziS9Axw8IUxJaVa3k4fZ/jM8V5Pbniw2/RXC+BjkRG70B3tcC72uB5/Xw/Cb8/294/PeArIcC9H4B4TJDc3ilfTFqFygegFSsVm2TnYOMmYN+w4ZJMWjWfIUyk5oM3xeaTLzIA0N4YbgN6weaG+/vy4Y/BMRUEK3c8nF1Rai3TtRUAsZg5EHId5WGUXITRwSaiww74/WLSMc+afWNDV+5/wpxze8yVl85KKqVI7+LGWAXED7CBHQVaRGFL1JcYJkCbrX6zERIqhz2P3j8wG9S7TVr/qWw3/5bSHcU/Hc5stfn5loYakJift6dLWyAL1uTlZJQnohCIkIvcWalY/l8PONt+bOYiIWXY0hxFXzCvq6iX0iGFeV5BYqO7HcxQ6WNFwVUewggTUjz8gWZLOQVyMeQT2C+x8VRs+Yrlo8HxPEQ9udP8Pgici6OvSq0xauyyPCLBckKuULii9s403QZkvEhQPDL8ArJskBIn//pzYGrPdlwtVez5iuUVf8NZNOeGOz37kyx361faDkJ/gAKG25hgZGXXrL5cU2/EFIeLjIYaaWBkUUh5fKnWfMVzWSwT/3ZmyUDi9CUUY6wuNCkiW8ornZ2I9UbO41mzVc8E/D51Ry6BjtNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRp0qRJkyZNmjRdbvT/C6ED0C9vab0AAAAASUVORK5CYII=', // Base64 encoded string or URL of your logo
				width: 200,
				margin: [-8, 0, 0, 7],
			},
			{
				text: 'Thankyou for your purchase',
				fontSize: 18,
				bold: true,
				alignment: 'left',
				margin: [0, 0, 0, 20],
			},
			{
				text: 'Billed By IGLoaded',
				fontSize: 14,
				bold: true,
				margin: [0, 0, 0, 5],
			},
			{
				text: `OrderId: #${orderId}`,
				fontSize: 12,
				bold: false,
				margin: [0, 0, 0, 2],
			},
			{
				text: `Date: ${date}`,
				fontSize: 12,
				bold: false,
				margin: [0, 0, 0, 20],
			},
			{
				text: 'Bill to:',
				fontSize: 14,
				bold: true,
				alignment: 'right',
				margin: [0, 0, 0, 5],
			},
			{
				text: customerName,
				fontSize: 12,
				bold: false,
				alignment: 'right',
				margin: [0, 0, 0, 2],
			},
			{
				alignment: 'right',
				text: customerEmail,
				fontSize: 12,
				margin: [0, 0, 0, 25],
			},
			{
				table: {
					widths: ['auto', 'auto', '*', '*', '*'],
					body: [
						[
							{ text: 'Title', lineHeight: 2.0 },
							'Description',
							'Price',
							'Quantity',
							'Total',
						],
						// Add your products here
						[
							createCell(title),
							createCell(description),
							createCell(ogamount),
							createCell(quantity),
							createCell(ogamount),
						],
						[
							createCell('Tax'),
							createCell(''),
							createCell(''),
							createCell(''),
							createCell(tax),
						],
						[
							createCell('PG Charges (3%)'),
							'',
							'',
							'',
							createCell(gatewayCharges),
						],
						[
							createCell('Discount'),
							'',
							'',
							'',
							createCell(discount),
						],
						[
							createCell('Total'),
							'',
							'',
							'',
							createCell(total),
						],
					],
				},
				layout: 'lightHorizontalLines', // optional
				margin: [0, 0, 0, 15],
			},
			{
				text:
					'This is an automated generated receipt of the purchase',
				fontSize: 12,
				bold: true,
				italics: true,
				margin: [0, 40, 0, 16],
			},
		],
	};
	var pdfBuffer;
	return new Promise((resolve, reject) => {
		try {
			const printer = new PdfPrinter(
				fontDescriptors
			);
			var pdfDoc = printer.createPdfKitDocument(dd);
			let chunks = [];
			pdfDoc.on('data', (chunk) => {
				chunks.push(chunk);
			});
			pdfDoc.on('end', () => {
				pdfBuffer = Buffer.concat(chunks);
				resolve({
					status: 200,
					message: 'PDF Created',
					bufferData: pdfBuffer,
				});
			});
			pdfDoc.end();
		} catch (error) {
			console.log(error);
			reject({
				status: 500,
				message: 'PDF Creation Failed',
				bufferData: null,
			});
		}
	});
};
